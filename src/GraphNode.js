Ext.define('Funcman.GraphNode', {
    alias: 'GraphNode',
    extend: 'Ext.Container',
    cls: 'thumb-wrap',
    
    isCollapsed: false,
    visible: true,

    items: [{
        xtype: 'container',
        items: [{
            xtype: 'component',
            autoEl: {
                tag: 'img',
                src: 'images/computer.png'
            }
        }]
    }, {
        xtype: 'label',
    }],

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        
        me.setName(this.name);
    },
    
    getIcon: function() {
        return this.getComponent(0).getComponent(0);
    },
    setName: function(name) {
        this.name = name;
        this.getComponent(1).setText(name);
    },

    getX: function() {
        return parseInt(this.getEl().getStyle('left'), 10);
    },
    getY: function() {
        return parseInt(this.getEl().getStyle('top'), 10);
    },
    setX: function(x) {
        return this.getEl().setLeft(x+'px');
    },
    setY: function(y) {
        return this.getEl().setTop(y+'px');
    },
    setXY: function(x,y) {
        return this.getEl().applyStyles({left: x+'px', top: y+'px'});
    },

    getIconSize: function() {
        return parseInt(this.getIcon().getEl().getStyle('width'), 10);
    },
    setIconSize: function(s) {
        this.getIcon().getEl().applyStyles({
            width: s+'px',
            height: s+'px'}
        );
    }
});