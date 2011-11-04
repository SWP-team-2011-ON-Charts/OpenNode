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
    fields:['name', 'rights-status', 'senority', 'dep', 'hired'],
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
                    var me = this.up(),
                        oldZoom = me.zoom,
                        zoom = me.getZoom(),
                        transition = (oldZoom <= 2 && zoom > 2) || (oldZoom > 2 && zoom <= 2);
                    if (transition) {
                        me.updateInfoWindowShow(zoom > 2);
                    }
                    me.view.layoutPlugin.refresh();
                }
            }
        }),
        Ext.create('Ext.grid.Panel', {
            title: 'Users',
            store: Ext.data.StoreManager.lookup('data_store'),
            columns: [
                  {text: 'Name',  dataIndex:'name'},
                  {text: 'Rights',  dataIndex:'rights-status'},
                  {text: 'mid',
                      xtype:'actioncolumn', 
                      width:80,
                      items: [{
                          icon: 'images/list-add.png',  // Use a URL in the icon config
                          tooltip: 'Edit',
                          handler: function(grid, rowIndex, colIndex) {
                              var rec = grid.getStore().getAt(rowIndex);
                              alert("Edit " + rec.get('name') + " rights.");
                          }
                      },{
                          icon: 'images/list-remove.png',
                          tooltip: 'Delete',
                          handler: function(grid, rowIndex, colIndex) {
                              var rec = grid.getStore().getAt(rowIndex);
                              grid.getStore().remove(rec);
                          }                
                      },{
                          icon: 'images/list-add.png',
                          handler: function(grid, rowIndex, colIndex) {
                              var rec = grid.getStore().getAt(rowIndex);
                              alert("Showing " + rec.get('name') + " rights.");
                          }                
                      }]
                  }
              ],
            width: 250,
            height: 600,
            cls: 'userpanel',
        })
    ],

    updateInfoWindowShow: function(show) {
        var me = this,
            ic = me.view.itemcontainer;

        // Show/hide infowindow on zoom transition
        if (show) {
            ic.items.each(function(item) {
                item.showInfoWindow();
            });
        } else {
            var selected = me.getSelectedNode();
            ic.items.each(function(item) {
                if (item !== selected) {
                    item.hideInfoWindow();
                }
            });
        }
    },

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
        this.zoom = 1.0 + (this.slider.getValue() / 10.0);
        return this.zoom;
    },

    addNode: function(node, norefresh) {
        var me = this;

        if (node.visible) {
            me.view.itemcontainer.add(node);
        }

        if (node.children) {
            me.addNodes(node.children, true);
        }

        if (!norefresh) {
            me.updateInfoWindowShow(me.getZoom() > 2);
            me.view.layoutPlugin.refresh();
        }
    },
    
    addNodes: function(nodes, norefresh) {
        var me = this;

        Ext.each(nodes, function(node) {
            me.addNode(node, true);
        });

        if (!norefresh) {
            me.updateInfoWindowShow(me.getZoom() > 2);
            me.view.layoutPlugin.refresh();
        }
    },

    removeNode: function(node, norefresh) {
        var me = this,
            el = node.getEl();

        me.view.items_remove.push(node);
        
        if (node.parent) {
            Ext.Array.remove(node.parent.children, node);
        }

        if (!norefresh) {
            me.view.layoutPlugin.refresh();
        }

        node.hideInfoWindow();

        el.setStyle({opacity: 1});
        el.animate({to: {opacity: 0}, callback: function() {
            me.remove(node);
            Ext.Array.remove(me.view.items_remove, node);
            node.destroy();
        }});
    },

    // This doesn't immediately redraw the whole graph
    removeNodeWithChildren: function(node) {
        var me = this;

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
