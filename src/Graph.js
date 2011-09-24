Ext.require(['Ext.data.*']);

Ext.regModel('Funcman.GraphNode', {
    fields: [
      {name: 'image', type: 'string'},
      {name: 'name', type: 'string'}
    ],
    proxy: {
        type: 'memory',
        id  : 'graph-nodes'
    }
//    belongsTo: 'Funcman.GraphNode',
//    hasMany  : {model: 'Funcman.GraphNode', name: 'children'}
});

Ext.define('Funcman.Graph', {
    extend: 'Ext.view.View',
    //alias: 'Graph',
    /** @cfg {String} src The image src */
    src: '',
    tpl: [
    '<tpl for=".">',
        //'<div class="thumb-wrap" style="position:relative; top:{top}px; left:{left}px;" id="{name}">',
        '<div class="thumb-wrap" id="{name}">',
        '<div class="thumb"><img src="{image}" title="{name}"></div>',
        '<span class="x-editable">{shortName}</span></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
],
/*
    getElConfig: function() {
        return {
            tag: 'img',
            src: this.src
        };
    },
    
    // null out this function, we can't set any html inside the image
    initRenderTpl: Ext.emptyFn,
*/
    addNode: function(node) {
        if (!this.store)
        {
            //this.store = 
        }
        this.setSrc(node.get('image'));
    },

    /**
     * Updates the {@link #src} of the image
     */
    setSrc: function(src) {
        var me = this,
            img = me.el;
        me.src = src;
        if (img) {
            img.dom.src = src;
        }
    }

});
