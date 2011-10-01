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
    cls: 'graph',
    layout: 'fit',

    items: [Ext.create('Ext.view.View', {
        uses: ['Ext.slider.Single', 'Ext.data.Store'],
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
        trackOver: true,
        layout:'absolute',
        
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
            this._isDragging = true;
            e.stopEvent();
        }
    },

    mouseuplistener: function(e, t, opts) {
        if (this._isDragging) {
            this.removeCls('movecursor');
            this.removeListener('mousemove', this.mousemovelistener);
            this._isDragging = false;
        }
    },

    mousemovelistener: function(e, t, opts) {
        if (this._isDragging) {
            //this.getEl().scroll("r", 1);
        }
    },

    initComponent: function() {
        this.callParent();
        this.view = this.items.getAt(0);
        this.slider = this.items.getAt(1);
        this._isDragging = false;
        this.addListener('mousewheel', this.mousewheellistener, this, {element: 'el'});
        this.addListener('mousedown', this.mousedownlistener, this, {element: 'el'});
        this.addListener('mouseup', this.mouseuplistener, this, {element: 'el'});
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
