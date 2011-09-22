Ext.require(['Ext.data.*']);

Ext.regModel('Funcman.GraphNode', {
    fields: [
      {name: 'image', type: 'string'},
      {name: 'name', type: 'string'}
    ]

//    belongsTo: 'Funcman.GraphNode',
//    hasMany  : {model: 'Funcman.GraphNode', name: 'children'}
});

Ext.define('Funcman.Graph', {
    extend: 'Ext.view.View',
    /** @cfg {String} src The image src */
    src: '',
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
