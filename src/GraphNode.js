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
    },
    getIconCenter: function() {
        var el = this.getEl(),
            iconEl = this.getIcon().getEl(),
            s = parseInt(iconEl.getStyle('width'), 10) / 2;
        
        return {
            x: parseInt(el.getStyle('left'), 10) + s,
            y: parseInt(el.getStyle('top'), 10) + s};
    },

    setXYSize: function(x,y,s) {
        this.getIcon().getEl().applyStyles({
            left: x+'px',
            top: y+'px',
            width: s+'px',
            height: s+'px'}
        );
    },

    highlight: function() {
        this.getEl().addCls('x-view-over');
    },
    clearHighlight: function() {
        this.getEl().removeCls('x-view-over');
    }
});