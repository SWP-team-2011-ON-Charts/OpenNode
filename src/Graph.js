/*
* Layout of the component:
* graph
*   viewcontainer
*     view
*       store
*         nodes
*     drawcomponent
*       lines
*   zoomslider
*/

Ext.define('Funcman.GraphRef', {
    extend: "Ext.data.Model",
    alias: 'GraphRef',
    fields: ['id'],
    proxy: {
        type: 'memory',
        id  : 'graph-node-refs'
    },
    belongsTo: 'Funcman.GraphNode'
});

Ext.define('Funcman.GraphNode', {
    extend: "Ext.data.Model",
    alias: 'GraphNode',
    fields: [
      {name: 'id', type: 'string'},
      {name: 'image', type: 'string'},
      {name: 'name', type: 'string'}
    ],
    proxy: {
        type: 'memory',
        id  : 'graph-nodes'
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
        tpl: [
            '<tpl for=".">',
                //'<div class="thumb-wrap">',
                '<div class="thumb-wrap" style="left:{x}px;top:{y}px;">',
                    '<div class="thumb">',
                    (!Ext.isIE6? '<img src="{image}" />' : 
                    '<div style="width:48px;height:48px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'{image}\')"></div>'),
                    '</div>',
                    '<span>{name}</span>',
                '</div>',
            '</tpl>'
        ],
        store: Ext.create('Ext.data.Store', { model: 'Funcman.GraphNode' }),
        overItemCls: 'x-view-over',
        itemSelector: 'div.thumb-wrap',
        cls: 'img-chooser-view showscrollbars',
        //trackOver: true,
        
        listeners: {
            selectionchange: function(dv, nodes ) {
                //alert('selection changed');
            },
        },
        }),
        Ext.create('Ext.draw.Component', {
            viewBox: false,
            autoSize: true,
        })
      ],
    }),
    Ext.create('Ext.slider.Single', {
        height: 60,
        value: 0,
        increment: 1,
        minValue: 0,
        maxValue: 10,
        vertical: true,
        listeners: {
            change: function(el, val) {
                var parent = this.up();
                var zoom = parent.getZoom();
                
                parent.draw.surface.removeAll(true);
                parent.draw.setSize(0, 0);
                parent.draw.surface.setSize(0, 0);
                
                // Move nodes further from or closer to each other depending on zoom
                // Also find graph size
                var maxx = 0, maxy = 0;
                parent.view.store.each( function(record) {
                    parent.computePositionByZoom(record, zoom);
                    var x = record.get('left');
                    var y = record.get('top');
                    if (maxx < x) maxx = x;
                    if (maxy < y) maxy = y;
                });
                maxx += parent.iconSize;
                maxy += parent.iconSize;
                parent.view.store.sync();
                
                // Connect nodes with their child nodes
                var halfIcon = parent.iconSize / 2;
                parent.view.store.each( function(record) {
                    record.children().each( function(child) {
                        var childrecord = parent.view.store.findRecord('id', child.get('id'));
                        var path =
                          'M ' + (record.get('x') + halfIcon) + ' ' + (record.get('y') + halfIcon) + ' ' +
                          'L ' + (childrecord.get('x') + halfIcon) + ' ' + (childrecord.get('y') + halfIcon)+ ' z';
                        parent.draw.surface.add({
                            //scale: { x: 1, y: 1, cx: 200, cy: 200 },
                            type: 'path',
                            path: path,
                            stroke: "#000",
                            "stroke-width": '3',
                            opacity: 0.5,
                            group: 'lines'
                        });
                    });
                });
                
                parent.draw.surface.items.items.forEach( function(d){
                    //d.setAttributes({scale: { x: zoom, y: zoom, cx: 50, cy: 50}}, true);
                });
                
                var el = parent.viewcontainer.getEl().dom;
                parent.draw.setSize(maxx, maxy);
                parent.draw.surface.setSize(maxx, maxy);
            }
        },
        cls: 'graphzoomslider',
    })
    ],

    listeners: {
        selectionchange: function(dv, nodes ) {
            //alert('selection changed');
        },
    },

    mousewheellistener: function(e, t, opts) {
        this.slider.setValue(this.slider.getValue() + e.getWheelDelta());
        e.stopEvent();
    },

    mousedownlistener: function(e, t, opts) {
        if (!this._isDragging) {
            this.addCls('movecursor');
            this.addListener('mousemove', this.mousemovelistener, this, {element: 'el'});
            var containerpos = this.viewcontainer.getPosition();
            var currentscroll = this.viewcontainer.getEl().getScroll();
            this._pananchor = [e.getX() - containerpos[0] + currentscroll.left, e.getY() - containerpos[1] + currentscroll.top];
            this._isDragging = true;
            e.stopEvent();
        }
    },

    stopdrag: function() {
        if (this._isDragging) {
            this.removeCls('movecursor');
            this.removeListener('mousemove', this.mousemovelistener);
            this._isDragging = false;
        }
    },

    mousemovelistener: function(e, t, opts) {
        if (this._isDragging) {
            var el = this.viewcontainer.getEl();
            var currentpos = e.getXY();
            var containerpos = this.viewcontainer.getPosition();
            el.scrollTo("right", (containerpos[0] + this._pananchor[0] - currentpos[0]));
            el.scrollTo("top", (containerpos[1] + this._pananchor[1] - currentpos[1]));
            e.stopEvent();
        }
    },

    initComponent: function() {
        this.callParent();
        var vc = this.viewcontainer = this.items.getAt(0);
        this.view = this.viewcontainer.items.getAt(0);
        this.draw = this.viewcontainer.items.getAt(1);
        this.slider = this.items.getAt(1);

        vc.addListener('mousewheel', this.mousewheellistener, this, {element: 'el'});
        vc.addListener('mousedown', this.mousedownlistener, this, {element: 'el'});
        vc.addListener('mouseup', this.stopdrag, this, {element: 'el'});
        //vc.addListener('mouseout', this.stopdrag, this, {element: 'el'});
    },

    getZoom: function() {
        return 1.0 + (this.slider.getValue() / 10.0);
    },

    computePosition: function(record) {
        this.computePositionByZoom(record, this.getZoom());
    },

    computePositionByZoom: function(record, zoom) {
        var left = record.get('left');
        var top = record.get('top');
        record.set('x', (left == undefined) ? 0 : parseInt(left * zoom));
        record.set('y', (top == undefined) ? 0 : parseInt(top * zoom));
    },

    addNode: function(node) {
        this.computePosition(node);
        this.view.store.add(node);
        
        /*for(var i in node.data.children) {
            alert(i.get('name'));
        }*/
    },
    
    removeNode: function(node) {
        this.store.remove(node);
    },
});
