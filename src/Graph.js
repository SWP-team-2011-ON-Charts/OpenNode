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
    idgen: 'sequential'
});

Ext.define('Funcman.GraphNode', {
    extend: "Ext.data.Model",
    alias: 'GraphNode',
    fields: [
      {name: 'id', type: 'string'},
      {name: 'image', type: 'string'},
      {name: 'name', type: 'string'},
      {name: 'info', type: 'string'}
    ],
    proxy: {
        type: 'memory',
        id  : 'graph-nodes',
    },
    hasMany  : {model: 'Funcman.GraphRef', name: 'children'}
});

Ext.define('Funcman.Graph', {
    extend: 'Ext.container.Container',
    alias: 'Graph',
    cls: 'graphcontainer',
    layout: 'fit',
    iconSize: 64,

    items: [
      Ext.create('Ext.container.Container', {
      cls: 'graphviewcontainer',
      _isDragging: false,

      items: [
        Ext.create('Ext.view.View', {
        
        tpl: 
        	[
            '<tpl for=".">',
                //'<div class="thumb-wrap">',
                '<div class="thumb-wrap" style="left:{x}px;top:{y}px;">',
                    '<div class="thumb">',
                    (!Ext.isIE6? '<img src="{image}" width={icon_size}px; height={icon_size}px;/>' : 
                    '<div style="width:48px;height:48px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'{image}\')"></div>'),
                    '</div>',
                    '<span>{name}</span>',
                '</div>',
            '</tpl>'
        ],

        store: Ext.create('Ext.data.Store', {
            model: 'Funcman.GraphNode',
            listeners: {
              add: {
                fn: function (store, record) {
                  //alert('add');
                }
              },
              remove: {
                fn: function (store, record) {
                  //alert('remove');
                }
              }
            }
        }),
        
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
        value: 0,
        increment: 1,
        minValue: 0,
        maxValue: 15,
        vertical: true,
        cls: 'graphzoomslider',
        listeners: {
            change: function(el, val) {
                var parent = this.up();
                
                // Move nodes further from or closer to each other depending on zoom
                var zoom = parent.getZoom();
                parent.view.store.each( function(record) {
                    parent.computePositionByZoom(record, zoom);
                });
                parent.view.store.sync();

                // Redraw lines
                parent.connecticons(parent);
                

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
                      'M ' + (record.get('x') + halfIcon) + ' ' + (record.get('y') + halfIcon) + ' ' +
                      'L ' + (childrecord.get('x') + halfIcon) + ' ' + (childrecord.get('y') + halfIcon)+ ' z';
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
            //var icon_size = record.get('icon_size');
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
        this.callParent();
        
        // Create shortcuts to subelements
        var vc = this.viewcontainer = this.items.getAt(0);
        this.view = vc.items.getAt(0);
        this.draw = vc.items.getAt(1);
        this.slider = this.items.getAt(1);


        // Set up mouse listeners
        vc.addListener('mousewheel', this.mousewheellistener, this, {element: 'el'});
        vc.addListener('mousedown', this.mousedownlistener, this, {element: 'el'});
        vc.addListener('mouseup', this.stopdrag, this, {element: 'el'});
        //vc.addListener('mouseout', this.stopdrag, this, {element: 'el'});
        
        var me = this;

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
        record.set('x', (left == undefined) ? 0 : parseInt(left * zoom));
        record.set('y', (top == undefined) ? 0 : parseInt(top * zoom));
        
        record.set('icon_size', parseInt(40 * zoom));
        //record.set('y_size', (top == undefined) ? 0 : parseInt(iconSize * zoom));
    },

    addNode: function(node) {
        this.computePosition(node);
        this.view.store.add(node);
        this.connecticons(this);
    },
    
    removeNode: function(node) {
        var me = this;
        var store = me.view.store;
        
        node.children().each( function(child) {
            var childrecord = store.findRecord('id', child.get('childid'));
            me.removeNode(childrecord);
        });

        me.view.store.remove(node);
        me.connecticons(this);
    },
});
