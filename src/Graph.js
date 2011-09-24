Ext.require(['Ext.data.*']);

Ext.regModel('Funcman.GraphNode', {
    alias: 'GraphNode',
    fields: [
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
    tpl: [
    '<tpl for=".">',
        //'<div class="thumb-wrap" style="position:relative; top:{top}px; left:{left}px;" id="{name}">',
        '<div class="thumb"><img src="{image}" title="{name}"></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
    ],
    store: Ext.create('Ext.data.Store', {
        model: 'Funcman.GraphNode',
        //autoLoad: true,
        autoSync: true
    }),
    itemSelector: 'div.thumb',

    addNode: function(node) {
        this.store.add(node);
        /*for(var i in node.data.children) {
            alert(i.get('name'));
        }*/
    },
});
