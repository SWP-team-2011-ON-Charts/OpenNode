/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


/*
* Layout of the component:
* graph
*   view
*     nodecontainer
*       nodes
*     drawcomponent
*       lines
*   zoomslider
*/

var store2 = 	Ext.create('Ext.data.Store', {
    storeId:'data_store',
    fields:['name', 'rights-status'],
    data:{'items':[
        { 'name': 'Super Dummy',  "rights-status":"Super User"},
        { 'name': 'Dummy 1', "rights-status":"Custom"},
        { 'name': 'Dummy 2', "rights-status":"Custom"},
        { 'name': 'Dummy 3', "rights-status":"Typical"}
    ]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    }
});

Ext.define('Funcman.Graph', {
    alias: 'Graph',
    extend: 'Ext.container.Container',
    cls: 'graphcontainer',
    graph_tree_container_size: 0,

    
    items: [
        Ext.create('Funcman.GraphView'),
        Ext.create('Ext.slider.Single', {
            height: 60,
            value: 5,
            increment: 1,
            minValue: 0,
            maxValue: 15,
            vertical: true,
            cls: 'graphzoomslider',
            listeners: {
                change: function(el, val) {
                    this.up().view.layoutPlugin.refresh();
                }
            }
        }),

        
        Ext.create('Ext.grid.Panel', {
            title: 'Users',
            store: Ext.data.StoreManager.lookup('data_store'),
            columns: [
                { header: 'Name',  dataIndex: 'name' },
                { header: 'Rigths', dataIndex: 'rights-status'}
            ],
            width: 200,
            height: 600,
            cls: 'userpanel',
        })
        
       
    ],

    // Mouse wheel controls the zoom slider
    mousewheellistener: function(e, t, opts) {
        this.slider.setValue(this.slider.getValue() + e.getWheelDelta());
        e.stopEvent();
    },

    initComponent: function() {
        var me = this;
        me.callParent();
        
        // Create shortcuts to subelements
        me.view = me.items.getAt(0);
        me.slider = me.items.getAt(1);
        
        me.on('mousewheel', me.mousewheellistener, me, {element: 'el'});
    },

    getSelectedNode: function() {
        return this.view.selectedItem;
    },

    setSelectedNode: function(node) {
        this.view.selectedItem = node;
    },

    getZoom: function() {
        return 1.0 + (this.slider.getValue() / 10.0);
    },

    animateRemove: function(node) {
        var el = node.getEl();
        el.setStyle({opacity: 1});
        el.animate({to: {opacity: 0}});
    },

    addNode: function(node, norefresh) {
        var me = this;

        me.view.items_offscreen.push(node);
        if (node.visible) {
            me.view.itemcontainer.add(node);
        }

        if (node.children) {
            me.addNodes(node.children, true);
        }

        if (!norefresh) {
            me.view.layoutPlugin.refresh();
        }
    },
    
    addNodes: function(nodes, norefresh) {
        var me = this;

        Ext.each(nodes, function(node) {
            me.addNode(node, norefresh);
        });

        if (!norefresh) {
            me.view.layoutPlugin.refresh();
        }
    },

    removeNode: function(node) {
        var me = this;
        var store = me.view.store;

        me.removeNodeWithChildren(node);
    },

    // This doesn't immediately redraw the whole graph
    removeNodeWithChildren: function(node) {
        var me = this;
        var store = me.view.store;

        if (node.infowindow)
            node.infowindow.destroy();

        var children = node.children;
        if (children) {
            while (children.length != 0) {
                me.removeNodeWithChildren(children[0]);
            }
        }

        var parent = node.get('parent');
        if (parent) {
            Ext.Array.remove(parent.children, node);
        }

        store.remove(node);
    },
});
