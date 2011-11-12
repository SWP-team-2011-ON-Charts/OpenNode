/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.GraphNode', {
    alias: 'GraphNode',
    extend: 'Ext.Container',
    cls: 'thumb-wrap',

    isCollapsed: false,
    visible: true,
    image: '../resources/images/computer.png', // default

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

        me.children = me.children || [];

        me.initElement();
    },

    initElement: function() {
        var me = this;

        if (!me.rendered) {
            me.on('render', me.initElement, me, {single: true});
            return;
        }

        me.view = me.up().up();

        me.setName(me.params.name);
        me.setImage(me.image);

        me.setMigrateTarget();
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

    addChild: function(node) {
        var me = this,
            n = me;

        if (node === me || me.children.indexOf(node) != -1) {
            return;
        }

        while (n.parent) {
            if (n.parent === node) {
                return;
            }
            n = n.parent;
        }

        // Add collapse button
        if (me.children.length == 0) {
            me.collapsebtn = me.add({
                xtype: 'tool',
                type: 'minus',
                handler: me.toggleCollapse,
                scope: me
            });
        }

        node.parent = me;
        me.children.push(node);
    },

    removeChild: function(node) {
        var me = this;

        Ext.Array.remove(me.children, node);

        // Remove collapse button
        if (me.children.length == 0) {
            me.remove(me.collapsebtn);
            delete me.collapsebtn;
        }
    },

    toggleCollapse: function() {
        var me = this;

        me.collapsebtn.setType(me.isCollapsed ? 'minus' : 'plus');
        me.isCollapsed = !me.isCollapsed;

        Ext.each(me.children, function(child) {
            me.collapseRecursive(child, !me.isCollapsed);
        });

        me.view.layoutPlugin.refresh();
    },

    collapseRecursive: function(item, expand) {
        var me = this;

        if (expand) {
            item.show();
        } else {
            item.hide();
            item.clearPathSprite();
        }

        if (!item.isCollapsed) {
            Ext.each(item.children, function(child) {
                me.collapseRecursive(child, expand);
            });
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
        
        me.dragZone.constrainTo(me.view.getEl());
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
                    source.parent.removeChild(source);
                }
                me.addChild(source);
                me.view.layoutPlugin.refresh();
                source.setMigrateTarget();
                return true;
            }
        });
    },

    getIcon: function() {
        return this.getComponent(0).getComponent(0);
    },
    getName: function() {
        return this.params.name;
    },
    setName: function(name) {
        this.params.name = name;
        this.getComponent(1).setText(name);
    },
    showName: function() {
        this.getComponent(1).show();
    },
    hideName: function() {
        this.getComponent(1).hide();
    },

    setImage: function(imageFile) {
        var icon = this.getIcon();
        icon.autoEl.src = imageFile;
        icon.doAutoRender();
    },

    getX: function() {
        return this.x;
    },
    getY: function() {
        return this.y;
    },
    setX: function(x) {
        this.x = x;
        return this.el.setLeft(x+'px');
    },
    setY: function(y) {
        this.y = x;
        return this.el.setTop(y+'px');
    },
    setXY: function(x,y) {
        this.x = x;
        this.y = y;
        return this.el.applyStyles({left: x+'px', top: y+'px'});
    },

    getIconSize: function() {
        return this.iconSize;
    },
    setIconSize: function(s) {
        this.iconSize = s;
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
        me.showName();
        me.setMigrateSource();
    },
    deselect: function() {
        var me = this;
        me.el.removeCls('x-item-selected');
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
    },
    setInfo: function() {
        if (this.infowindow) {
            this.infowindow.setInfo();
        }
    },

    getRoot: function() {
        var root = this;
        while (root.parent) {
            root = root.parent;
        }
        return root;
    }
});