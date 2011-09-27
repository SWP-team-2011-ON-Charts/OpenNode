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
    extend: 'Ext.view.View',
    alias: 'Graph',
    uses: ['Ext.slider.Single', 'Ext.data.Store'],
    tpl: [
        // '<div class="details">',
            '<tpl for=".">',
                '<div class="thumb-wrap">',
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
        //autoLoad: true,
        autoSync: true
    }),
    overItemCls: 'x-view-over',
    itemSelector: 'div.thumb-wrap',
    resizable: false,
    trackOver: true,

    addNode: function(node) {
        this.store.add(node);
        /*for(var i in node.data.children) {
            alert(i.get('name'));
        }*/
    },
    
    removeNode: function(node) {
        this.store.remove(node);
    },
    
    listeners: {
      itemmousedown: function(a,b,c,d,e) {
      },
      itemmouseup: function(a,b,c,d,e) {
      },
      beforecontainermousedown: function(view, e, opts) {
      },
      containermousedown: function(view, e, opts) {
      },
      selectionchange: function(dv, nodes ) {
      }
    }
});
