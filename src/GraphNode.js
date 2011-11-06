Ext.define('Funcman.GraphNode', {
    alias: 'GraphNode',
    extend: 'Ext.Container',
    cls: 'thumb-wrap',

    isCollapsed: false,
    visible: true,
    image: 'images/computer.png', // default

    items: [{
        xtype: 'container',
        items: [{
            xtype: 'component',
            autoEl: {
                tag: 'img'
            }
        }]
    }, {
        xtype: 'label',
    }],

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        
        me.setName(this.name);
        
        me.initMigrate();
        me.setImage(me.image);
    },

    initMigrate: function() {
        var me = this;

        if (!me.rendered) {
            me.on('render', me.initMigrate, me, {single: true});
            return;
        }

        this.setMigrateTarget();
    },

    onDestroy : function() {
        var me = this;
        me.clearPathSprite();
        if (me.iw) {
            me.iw.destroy();
            delete me.iw;
        }
    },
    
    clearPathSprite: function() {
        if (this.pathSprite) {
            this.pathSprite.destroy();
            delete this.pathSprite;
        }
    },

    setMigrateSource: function() {
        var me = this;

        if (me.dragZone) {
            return;
        }

        me.dragZone = new Ext.dd.DragZone(me.el, {

            getDragData: function(e) {

                var sourceEl = e.getTarget();

                // Clone the node to produce a ddel element for use by the drag proxy.
                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return {
                        ddel: d,
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        dragSource: me
                    }
                }
            },
            
            getRepairXY: function() {
                // If no target found, the ghost should fly back to its original location
                return this.dragData.repairXY;
            }
        });
        
        me.dragZone.constrainTo(me.up().up().getEl());
    },

    setMigrateTarget: function() {
        var me = this;

        if (me.dropTarget) {
            return;
        }

        me.dropTarget = new Ext.dd.DropTarget(me.el, {
            onNodeOver: function(target, dd, e, data) { 
                return Ext.dd.DropZone.prototype.dropAllowed;
            },
            notifyDrop: function(source, e, data) {
                var source = data.dragSource;
                if (source.parent) {
                    Ext.Array.remove(source.parent.children, source);
                }
                source.parent = me;
                me.children.push(source);
                me.up().up().layoutPlugin.refresh();
                source.setMigrateTarget();
                return true;
            }
        });
    },

    getIcon: function() {
        return this.getComponent(0).getComponent(0);
    },
    setName: function(name) {
        this.name = name;
        this.getComponent(1).setText(name);
    },
    setImage: function(imageFile) {
        var icon = this.getIcon();
        icon.autoEl.src = imageFile;
        icon.doAutoRender();
    },

    getX: function() {
        return parseInt(this.el.getStyle('left'), 10);
    },
    getY: function() {
        return parseInt(this.el.getStyle('top'), 10);
    },
    setX: function(x) {
        return this.el.setLeft(x+'px');
    },
    setY: function(y) {
        return this.el.setTop(y+'px');
    },
    setXY: function(x,y) {
        return this.el.applyStyles({left: x+'px', top: y+'px'});
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
        var el = this.el,
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
        this.el.addCls('x-view-over');
    },
    clearHighlight: function() {
        this.el.removeCls('x-view-over');
    },
    
    select: function() {
        var me = this;
        me.el.addCls('x-item-selected');
        me.showInfoWindow();
        me.setMigrateSource();
    },
    deselect: function(hideiw) {
        var me = this;
        me.el.removeCls('x-item-selected');
        if (hideiw) {
            me.hideInfoWindow();
        }
        if (me.dragZone) {
            me.dragZone.destroy();
            me.dropTarget.destroy();
            delete me.dragZone;
            delete me.dropTarget;
            me.setMigrateTarget();
        }
    },

    showInfoWindow: function() {
        if (this.infowindow) {
            this.infowindow.show();
        }
    },
    hideInfoWindow: function() {
        if (this.infowindow) {
            this.infowindow.hide();
        }
    }
});