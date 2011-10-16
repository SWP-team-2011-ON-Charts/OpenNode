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

Ext.define('Funcman.GraphRef', {
    extend: "Ext.data.Model",
    alias: 'GraphRef',
    fields: ['childid'],
    belongsTo: 'Funcman.GraphNode',
});

Ext.define('Funcman.GraphNode', {
    extend: "Ext.data.Model",
    alias: 'GraphNode',
    fields: [
      {name: 'id', type: 'string'},
      {name: 'nodeType', type: 'string'},
      {name: 'image', type: 'string'},
      {name: 'name', type: 'string'},
      {name: 'info', type: 'string'},
    ],
    proxy: {
        type: 'memory',
    },
    infowindow: null,
    hasMany  : {model: 'Funcman.GraphRef', name: 'children'}
});

Ext.define('Funcman.Graph', {
    extend: 'Ext.container.Container',
    alias: 'Graph',
    cls: 'graphcontainer',
    layout: 'fit',
    iconSize: 40,

    items: [
      Ext.create('Ext.container.Container', {
      cls: 'graphviewcontainer',
      _isDragging: false,


      items: [
        Ext.create('Ext.view.View', {

            // tpl itself is set later
            tpl_text: new Ext.XTemplate(
                    '<tpl for=".">',
                        //'<div class="thumb-wrap">',
                        '<div class="thumb-wrap" style="left:{x}px;top:{y}px;">',
                            '<div class="thumb" style="width:{icon_size}px;height:{icon_size}px;">',
                            (!Ext.isIE6? '<img src="{image}" width={icon_size}px; height={icon_size}px;/>' : 
                            '<div style="width:48px;height:48px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'{image}\')"></div>'),
                            '</div>',
                            '<span class = "name">{name}</span>',
                        '</div>',
                    '</tpl>'
            ),
            tpl_notext: new Ext.XTemplate(
                    '<tpl for=".">',
                        //'<div class="thumb-wrap">',
                        '<div class="thumb-wrap" style="left:{x}px;top:{y}px;">',
                            '<div class="thumb" style="width:{icon_size}px;height:{icon_size}px;">',
                            (!Ext.isIE6? '<img src="{image}" width={icon_size}px; height={icon_size}px;/>' : 
                            '<div style="width:48px;height:48px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'{image}\')"></div>'),
                            '</div>',
                        '</div>',
                    '</tpl>'
            ),

            store: Ext.create('Ext.data.Store', { model: 'Funcman.GraphNode' }),
            
            overItemCls: 'x-view-over',
            itemSelector: 'div.thumb-wrap',
            cls: 'img-chooser-view showscrollbars'
        }),
        Ext.create('Ext.draw.Component', {
            viewBox: false,
            autoSize: true,
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
                var me = this.up();
                var zoom = me.getZoom();
                var view = me.view;
                
                view.tpl = (zoom < 1.4) ? view.tpl_notext : view.tpl_text;
                
                // Move nodes further from or closer to each other depending on zoom
                view.store.each( function(record) {
                    me.computePositionByZoom(record, zoom);
                });
                view.store.sync();

                // Redraw lines
                me.connecticons(me);
            }
        }
    })
    ],

    // Create lines connecting the icons
    connecticons: function(parent) {
        var maxx = 0, maxy = 0;
        var halfIcon = parent.iconSize / 2;
        var draw = parent.draw;

        // Clear all lines
        draw.surface.removeAll(true);
        draw.setSize(0, 0);

        // Connect nodes with their child nodes
        // Also find graph size
        var store = parent.view.store;
        store.each( function(record) {
            record.children().each( function(child) {
                var childrecord = store.findRecord('id', child.get('childid'));
                
                if (childrecord) {
                    // Create a path from the center of one icon to the center of the other
                    var path =
                      'M ' + (record.get('x') + record.get('icon_size')/2) + ' ' + (record.get('y') + record.get('icon_size')/2) + ' ' +
                      'L ' + (childrecord.get('x') + record.get('icon_size')/2) + ' ' + (childrecord.get('y') + record.get('icon_size')/2)+ ' z';
                    var sprite = {
                        type: 'path',
                        path: path,
                        stroke: "#0CC",
                        "stroke-width": '3',
                        opacity: 0.5,
                        group: 'lines'
                    };
                    draw.surface.add(sprite);
                }
            });
            
            var x = record.get('x');
            var y = record.get('y');
            if (maxx < x) maxx = x;
            if (maxy < y) maxy = y;
        });

        draw.surface.items.items.forEach( function(d){
            d.redraw();
        });

        maxx += parent.iconSize;
        maxy += parent.iconSize;

        // Set drawing area
        var el = parent.viewcontainer.getEl().dom;
        draw.setSize(maxx, maxy);
    },

    // Mouse wheel controls the zoom slider
    mousewheellistener: function(e, t, opts) {
        this.slider.setValue(this.slider.getValue() + e.getWheelDelta());
        e.stopEvent();
    },

    mousedownlistener: function(e, t, opts) {
        if (this._isDragging)
            return;

        this.addCls('movecursor');
        this.addListener('mousemove', this.mousemovelistener, this, {element: 'el'});
        var containerpos = this.viewcontainer.getPosition();
        var currentscroll = this.viewcontainer.getEl().getScroll();
        this._pananchor = [e.getX() - containerpos[0] + currentscroll.left, e.getY() - containerpos[1] + currentscroll.top];
        this._isDragging = true;
        e.stopEvent();
    },

    stopdrag: function() {
        if (!this._isDragging)
            return;

        this.removeCls('movecursor');
        this.removeListener('mousemove', this.mousemovelistener);
        this._isDragging = false;
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
        vc.addListener('mousewheel', me.mousewheellistener, me, {element: 'el'});
        vc.addListener('mousedown', me.mousedownlistener, me, {element: 'el'});
        vc.addListener('mouseup', me.stopdrag, me, {element: 'el'});
        //vc.addListener('mouseout', this.stopdrag, this, {element: 'el'});
        
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

    getZoom: function() {
        return 1.0 + (this.slider.getValue() / 10.0);
    },

    // Reads a node's left/top fields, multiplies by zoom and writes back x/y fields
    computePosition: function(record) {
    	this.computePositionByZoom(record, this.getZoom());
    },

    computePositionByZoom: function(record, zoom) {
        var left = record.get('left');
        var top = record.get('top');
        var icon_size = this.iconSize * zoom;
        
        left = (left == undefined) ? 0 : parseInt(left * zoom);
        top = (top == undefined) ? 0 : parseInt(top * zoom);

        record.set('x', left);
        record.set('y', top);
        if (zoom > 2) {
            record.infowindow.setPosition(left, top + icon_size);
            record.infowindow.show();
        }
        else {
            record.infowindow.hide();
        }
        
        record.set('icon_size', icon_size);
        //record.set('y_size', (top == undefined) ? 0 : parseInt(iconSize * zoom));
    },
    
    reorderNodes: function() {
    	var me = this;
    	var store = me.view.store;
    	var zoom = me.getZoom();
    	var dcCount = 0;
    	var pmCount = 0;
    	var vmCount = 0;
    	var uuCount = 0;
    	
    	store.each( function(record) {
    		var nodetype = record.get('nodeType');
    		if (nodetype == "dc") {
                record.set('left', (64 + dcCount * 192));
                dcCount++;
            }
            else if (nodetype == "pm") {
            	record.set('left', (pmCount * 64));
                pmCount++;
            }
            else if (nodetype == "vm") {
            	record.set('left', (vmCount * 64));
                vmCount++;
            }
    		
            else if (nodetype == "uu") {
            	record.set('left', (uuCount * 64));
                uuCount++;
            }
            else {
                // Unknown node type
                return;
            }
            me.computePositionByZoom(record, zoom);
        });
    },

    addNode: function(node) {
        var me = this;

        me.computePosition(node);
        me.view.store.add(node);
        me.view.store.sort('id', 'ASC');
        me.reorderNodes();
        me.connecticons(me);
    },
    
    removeNode: function(node) {
        var me = this;
        var store = me.view.store;

        me.removeNodeWithChildren(node);

        me.reorderNodes();
        me.connecticons(me);
    },

    // This doesn't immediately redraw the whole graph
    removeNodeWithChildren: function(node) {
        var me = this;
        var store = me.view.store;

        if (node.infowindow)
            node.infowindow.destroy();

        node.children().each( function(childref) {
            var child = store.findRecord('id', childref.get('childid'));
            if (child != null){
            	me.removeNodeWithChildren(child);
            }
        });

        store.remove(node);
    },
});
