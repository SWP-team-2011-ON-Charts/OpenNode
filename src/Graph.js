/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


/*
* Layout of the component:
* graph
*   viewcontainer
*     view
*       store
*         GraphNodes
*     drawcomponent
*       lines
*   zoomslider
*/

Ext.define('Funcman.GraphNode', {
    extend: "Ext.data.Model",
    alias: 'GraphNode',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'res_id', type: 'int'},   // resource id     - 0
        {name: 'path', type: 'string'},  // unique path     - "http://oms/computes/0/"
        {name: 'type', type: 'string'},  // node type       - "vm", "pm", "dc", "user"
        {name: 'image', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'parent', type: 'GraphNode'},
        {name: 'x', type: 'int'},
        {name: 'y', type: 'int'}
    ],
    proxy: {
        type: 'memory',
    },
});

Ext.define('Funcman.Graph', {
    extend: 'Ext.container.Container',
    alias: 'Graph',
    cls: 'graphcontainer',
    layout: 'fit',
    iconSize: 40,
    graph_tree_container_size: 0,

    items: [
      Ext.create('Ext.container.Container', {
      cls: 'graphviewcontainer',
      _isDragging: false,

      items: [
        Ext.create('Ext.view.View', {

            // tpl itself is set later according to zoom
            tpl_text: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="thumb-wrap" style="left:{x}px; top:{y}px">',
                        '<div id = "{id}" class="thumb">',
                        (!Ext.isIE6? '<img src="{image}" width={icon_size}px; height={icon_size}px;/>' :
                        '<div style="width:48px;height:48px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'{image}\')"></div>'),
                        '</div>',
                        '<span>{name}</span>',
                    '</div>',
                '</tpl>'
            ),
            tpl_notext: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="thumb-wrap" style="left:{x}px; top:{y}px">',
                        '<div id = "{id}" class="thumb">',
                        (!Ext.isIE6? '<img src="{image}" width={icon_size}px; height={icon_size}px;/>' :
                        '<div style="width:48px;height:48px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'{image}\')"></div>'),
                        '</div>',
                    '</div>',
                '</tpl>'
            ),

            store: Ext.create('Ext.data.Store', { model: 'Funcman.GraphNode' }),
            listeners: {
                selectionChange: function(dv, nodes) {
                    var me = this.up().up();
                    if (nodes.length != 0) {
                        var layoutPlugin = me.view.plugins[0];
                        layoutPlugin.refresh.call(layoutPlugin);
                    }
                }
            },
            
            plugins : [
                Ext.create('Funcman.GraphLayout', {
                    duration  : 200,
                    idProperty: 'id'
                })
            ],
            id: 'nodes',
            
            allowDeselect: true,
            overItemCls: 'x-view-over',
            itemSelector: 'div.thumb-wrap',
            cls: 'img-chooser-view'// showscrollbars'
        }),
        Ext.create('Ext.draw.Component', {
            viewBox: false,
            autoSize: true
        }),
      ],
    }),
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
                    view = me.view,
                    layoutPlugin = me.view.plugins[0];

                view.tpl = (me.getZoom() < 1.4) ? view.tpl_notext : view.tpl_text;
                layoutPlugin.refresh.call(layoutPlugin);
            }
        }
    })
    ],

    // Create lines connecting the icons
    connecticons: function() {
        var me = this;
        var maxx = 0, maxy = 0,
            halfIcon = me.iconSize / 2,
            draw = me.draw;

        // Clear all lines
        draw.surface.removeAll(true);
        draw.setSize(0, 0);

        // Connect nodes with their child nodes
        // Also find graph area
        var store = me.view.store,
            dataviewID = me.view.id;

        store.each( function(record) {
            var recordEl = Ext.get(dataviewID + '-' + record.internalId);
            var x1 = recordEl.getLeft(true) + recordEl.getWidth() / 2,
                y1 = recordEl.getTop(true) + recordEl.getHeight() / 2;

            Ext.each(record.children, function(child) {
                var childEl = Ext.get(dataviewID + '-' + child.internalId);
                var x2 = childEl.getLeft(true) + childEl.getWidth() / 2,
                    y2 = childEl.getTop(true) + childEl.getHeight() / 2;

                // Create a path from the center of one icon to the center of the other
                var path =
                  'M ' + x1 + ' ' + y1 + ' ' +
                  'L ' + x2 + ' ' + y2 + ' z';

                draw.surface.add({
                    type: 'path',
                    path: path,
                    stroke: "#0CC",
                    "stroke-width": '3',
                    opacity: 0.5,
                    group: 'lines'
                });
            });
            
            if (maxx < x1) maxx = x1;
            if (maxy < y1) maxy = y1;
        });

        draw.surface.items.items.forEach( function(d){
            d.redraw();
        });

        // Set line drawing area
        draw.setSize(maxx + me.iconSize, maxy + me.iconSize);
    },

    // Mouse wheel controls the zoom slider
    mousewheellistener: function(e, t, opts) {
        this.slider.setValue(this.slider.getValue() + e.getWheelDelta());
        e.stopEvent();
    },

    mousedownlistener: function(e, t, opts) {
        var me = this;
        if (me._isDragging)
            return;

        me.addCls('movecursor');
        me.on('mousemove', me.mousemovelistener, me, {element: 'el'});
        var containerpos = me.viewcontainer.getPosition();
        var currentscroll = me.viewcontainer.getEl().getScroll();
        me._pananchor = [e.getX() - containerpos[0] + currentscroll.left, e.getY() - containerpos[1] + currentscroll.top];
        me._isDragging = true;

        e.stopEvent();
    },

    stopdrag: function(e) {
        var me = this;

        if (!me._isDragging)
            return;

        me.removeCls('movecursor');
        me.removeListener('mousemove', me.mousemovelistener);
        me._isDragging = false;

        if (e.getTarget().id == me.viewcontainer.getEl().id)
            me.setSelectedNode(null);
    },

    mousemovelistener: function(e, t, opts) {
        if (!this._isDragging)
            return;

        var el = this.viewcontainer.getEl();
        var currentpos = e.getXY();
        var containerpos = this.viewcontainer.getPosition();
        el.scrollTo("right", (containerpos[0] + this._pananchor[0] - currentpos[0]));
        el.scrollTo("top", (containerpos[1] + this._pananchor[1] - currentpos[1]));
        e.stopEvent();
    },

    initComponent: function() {
        var me = this;
        me.callParent();
        
        // Create shortcuts to subelements
        var vc = me.viewcontainer = me.items.getAt(0);
        me.view = vc.items.getAt(0);
        me.draw = vc.items.getAt(1);
        me.slider = me.items.getAt(1);

        // Set up mouse listeners
        vc.on('mousewheel', me.mousewheellistener, me, {element: 'el'});
        vc.on('mousedown', me.mousedownlistener, me, {element: 'el'});
        vc.on('mouseup', me.stopdrag, me, {element: 'el'});
        //vc.on('mouseout', this.stopdrag, this, {element: 'el'});
        
        me.view.tpl = me.view.tpl_text;
        
        me.addEvents(
            /**
             * @event selectionchange
             * Fires when the selected nodes change. Relayed event from the underlying selection model.
             * @param {Ext.view.View} this
             * @param {Array} selections Array of the selected nodes
             */
            'selectionchange'
        );
        
        me.relayEvents(me.view, ['selectionchange']);
    },

    getSelectedNode: function() {
        return this.view.getSelectionModel().getSelection()[0];
    },

    setSelectedNode: function(node) {
        var sm = this.view.getSelectionModel();
        if (node) {
            sm.select([node], false);
        } else {
            sm.deselectAll();
        }
    },

    getZoom: function() {
        return 1.0 + (this.slider.getValue() / 10.0);
    },

    addNode: function(node) {
        var me = this;
        me.view.store.add(node);
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