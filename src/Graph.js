Ext.regModel('Funcman.GraphNode', {
    alias: 'GraphNode',
    fields: [
      {name: 'id', type: 'int'},
      {name: 'image', type: 'string'},
      {name: 'name', type: 'string'}
    ],
    proxy: {
        type: 'memory',
        id  : 'graph-nodes'
    },
    belongsTo: 'Funcman.GraphNode',
    hasMany  : {model: 'Funcman.GraphNode', name: 'children'}
});

Ext.define('Funcman.Graph', {
    extend: 'Ext.container.Container',
    alias: 'Graph',
    cls: 'graphcontainer',
    layout: 'fit',

    items: [
      Ext.create('Ext.container.Container', {
      cls: 'graphviewcontainer',
      _isDragging: false,

      items: [
        Ext.create('Ext.view.View', {
        tpl: [
            // '<div class="details">',
                '<tpl for=".">',
                    //'<div class="thumb-wrap">',
                    '<div class="thumb-wrap" style="left:{left-computed}px;top:{top-computed}px;">',
                        '<div class="thumb">',
                        (!Ext.isIE6? '<img src="{image}" />' : 
                        '<div style="width:48px;height:48px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'{image}\')"></div>'),
                        '</div>',
                        '<span>{name}</span>',
                    '</div>',
                '</tpl>'
            // '</div>'
        ],
        store: Ext.create('Ext.data.Store', {
            model: 'Funcman.GraphNode',
        }),
        overItemCls: 'x-view-over',
        itemSelector: 'div.thumb-wrap',
        cls: 'img-chooser-view showscrollbars',
        //trackOver: true,
        
        listeners: {
            itemmousedown: function(a,b,c,d,e) {
            },
            itemmouseup: function(a,b,c,d,e) {
            },
            selectionchange: function(dv, nodes ) {
                //alert('selection changed');
            },
        },
        }),
        Ext.create('Ext.draw.Component', {
            style: {
                width: '100%',
            },
            width: 500,
            height: 500,
            viewBox: false,
            items: [{
                type: 'circle',
                fill: '#79BB3F',
                radius: 100,
                x: 100,
                y: 100
            }]
        })
      ],
    }),
    Ext.create('Ext.slider.Single', {
        height: 60,
        value: 3,
        increment: 1,
        minValue: 0,
        maxValue: 10,
        vertical: true,
        listeners: {
            change: function(el, val) {
                var parent = this.up();
                var zoom = parent.getZoom();
                parent.view.store.each( function(record) {
                    parent.computePositionByZoom(record, zoom);
                });
                parent.view.store.sync();
            }
        },
        cls: 'graphzoomslider',
    })
    ],

    listeners: {
        itemmousedown: function(a,b,c,d,e) {
        },
        itemmouseup: function(a,b,c,d,e) {
        },
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
        record.set('left-computed', (left == undefined) ? 0 : parseInt(left * zoom));
        record.set('top-computed', (top == undefined) ? 0 : parseInt(top * zoom));
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
