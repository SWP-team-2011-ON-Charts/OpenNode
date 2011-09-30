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

    style: {
        backgroundColor:'#F8F8F8',
        position: 'relative'
    },

    items: [Ext.create('Ext.view.View', {
        uses: ['Ext.slider.Single', 'Ext.data.Store'],
        tpl: [
            // '<div class="details">',
                '<tpl for=".">',
                    '<div class="thumb-wrap" style="left:{left}px;top:{top}px;">',
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
            //autoSync: true
        }),
        overItemCls: 'x-view-over',
        itemSelector: 'div.thumb-wrap',
        cls: 'img-chooser-view',
        resizable: false,
        trackOver: true,
        
        listeners: {
            itemmousedown: function(a,b,c,d,e) {
            },
            itemmouseup: function(a,b,c,d,e) {
            },
            containermousedown: function(view, e, opts) {
                //alert('moving');
            },
            selectionchange: function(dv, nodes ) {
                //alert('selection changed');
            },
            mouseover: function(view, e, opts) {
                //alert('dragging 2');
            },
        }
    }),
    Ext.create('Ext.slider.Single', {
        height: 60,
        value: 5,
        increment: 1,
        minValue: 0,
        maxValue: 10,
        vertical: true,
        listeners: {
            change: function(el, val) {
            }
        },
        cls: 'graphzoomslider',
    })
    ],

    initComponent: function() {
        this.callParent();
        this.view = this.items.items[0];
        this.slider = this.items.items[1];
    },

    addNode: function(node) {
        this.view.store.add(node);
        /*for(var i in node.data.children) {
            alert(i.get('name'));
        }*/
    },
    
    removeNode: function(node) {
        this.store.remove(node);
    },
});
