/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.GraphView', {
    alias: 'GraphView',
    extend: 'Ext.Container',
    cls: 'graphview',

    isMouseDown: false,
    isDragging: false,
    isMigrating: false,
    
    iconSize: 40,
    items_remove: [],
    items: [
        {xtype: 'container'},
        {xtype: 'draw', viewBox: false, height: 0, width: 0 }
    ],

    plugins : [Ext.create('Funcman.GraphLayout')],
    id: 'nodes',
    
    initComponent : function() {
        var me = this;
        me.callParent();
        
        me.layoutPlugin = me.plugins[0];
        me.itemcontainer = me.getComponent(0);
        me.draw = me.getComponent(1);

        me.on('mousedown', me.mousedownlistener, me, {element: 'el'});
        me.on('mousemove', me.highlightlistener, me, {element: 'el'});
        
        me.initSelModel();
    },

    initSelModel: function() {
        var me = this;

        if (!me.rendered) {
            me.on('render', me.initSelModel, me, {single: true});
            return;
        }
    },

    getSelectedItem: function() {
        return this.selectedItem;
    },

    setSelectedItem: function(item) {
        var me = this,
            graph = me.up(),
            zoom = graph.getZoom();

        if (item === me.selectedItem) {
            return;
        }

        if (me.selectedItem) {
            me.selectedItem.deselect();
            if (zoom <= graph.zoomInLevel) {
                me.selectedItem.hideInfoWindow();
            }
            if (zoom <= graph.zoomOutLevel) {
                me.selectedItem.hideName();
            }
        }

        me.selectedItem = item;
        if (item) {
            item.select();
        }
    },

    getHighlightedItem: function() {
        return this.highlightItem;
    },

    setHighlightedItem: function(item) {
        var me = this;

        if (item === me.highlightItem) {
            return;
        }
    
        if (me.highlightItem) {
            me.highlightItem.clearHighlight();
        }

        if (Ext.Array.contains(me.items_remove, item)) {
            me.highlightItem = null;
            return;
        }

        me.highlightItem = item;
        if (item) {
            item.highlight();
        }
    },

    getItemFromEl: function(el) {
        while (el) {
            var item = Ext.ComponentManager.get(el.id);
            if (item instanceof Funcman.GraphNode) {
                return item;
            } else if (item instanceof Funcman.GraphView) {
                break;
            } else if (!item) {
                break;
            }
            el = el.parentNode;
        }
        return null;
    },

    highlightlistener: function(e, t, opts) {
        if (t === this.highlightEl) {
            return;
        }
    
        this.setHighlightedItem(this.getItemFromEl(t));
        this.highlightEl = t;
    },

    mousedownlistener: function(e, t, opts) {
        var me = this,
            body = Ext.getBody();

        me.addCls('movecursor');
        var Event = Ext.EventManager;
        Event.on(document, "mousemove", me.mousemovelistener, this, true);
        Event.on(document, "mouseup", me.mouseuplistener, this, true);

        var containerpos = me.getPosition();
        var currentscroll = me.el.getScroll();
        me._pananchor = [e.getX() - containerpos[0] + currentscroll.left, e.getY() - containerpos[1] + currentscroll.top];
        me.isMouseDown = true;

        e.stopEvent();
    },

    mouseuplistener: function(e,t) {
        var me = this,
            body = Ext.getBody();

        // If not dragging or migrating, then an item was selected
        if (!me.isDragging && !me.isMigrating) {
            if (e.button != 2) {
                me.setSelectedItem(me.getItemFromEl(t));
            }
        }

        if (me.isMigrating) {
            me.isMigrating = false;
        }

        me.isMouseDown = false;
        me.isDragging = false;

        me.removeCls('movecursor');
        var Event = Ext.EventManager;
        Event.un(document, 'mousemove', me.mousemovelistener, this);
        Event.un(document, 'mouseup', me.mouseuplistener, this);
        
        e.stopEvent();
    },

    mousemovelistener: function(e, t, opts) {
        var me = this;

        if (!me.isDragging && !me.isMigrating && me.isMouseDown) {
            // If we're on a selected item, start migrating it, otherwise drag the graph
            if (me.selectedItem && me.getItemFromEl(t) === me.selectedItem) {
                me.isMigrating = true;
            } else {
                me.isDragging = true;
            }
        }

        if (me.isDragging) {
            var el = this.el,
                currentpos = e.getXY(),
                containerpos = this.getPosition();
            el.scrollTo("right", (containerpos[0] + this._pananchor[0] - currentpos[0]));
            el.scrollTo("top", (containerpos[1] + this._pananchor[1] - currentpos[1]));
            e.stopEvent();
        } else if (me.isMigrating) {
            e.stopEvent();
        }
    },

    drawLines: function() {
        var me = this,
            max = {x: 0, y: 0, h: 0},
			user = this.up().userpanel.curr_user;
			

        // Connect nodes with their child nodes starting from the root elements
        // Also find graph area
        me.itemcontainer.items.each( function(item) {
            if (!item.parent) {
                me.drawLine(item, max, me.draw.surface, user);
            }
        });

        // Set line drawing area
        me.draw.setSize(max.x + me.iconSize, max.y + max.h);
    },

    drawLine: function(item, max, surface, user) {
        var me = this,
            ic1 = item.getIconCenter(),
            height = item.getHeight();

        if (max.x < ic1.x) max.x = ic1.x;
        if (max.y < ic1.y) max.y = ic1.y;
        if (max.h < height) max.h = height;

        if (!item.isCollapsed) {
            Ext.each(item.children, function(child) {

                var ic2 = child.getIconCenter();

                // Create a path from the center of one icon to the center of the other
                var path =
                  'M ' + ic1.x + ' ' + ic1.y + ' ' +
                  'L ' + ic2.x + ' ' + ic2.y + ' z',
                    color;
				
				if (!user) {
                    color = "#0CC";
                } else {
                    var compute = user.computes().findRecord('computer_id', child.id, 0, false, false, true);
                    if (compute) {
                        if (compute.get('Write') == 'true') {
                            color = "#C00";
                        } else if (compute.get('Read') == 'true') {
                            color = "#0C0";
                        } else {
                            color = "#0CC";
                        }
                    } else {
                        color = "#0CC";
                    }
                }

                if (!child.pathSprite) {
                    child.pathSprite = Ext.create('Ext.draw.Sprite', {
                        type: 'path',
                        "stroke-width": '3',
                        opacity: 0.5,
                        surface: surface
                    });
                }
                child.pathSprite.setAttributes({path: path, stroke: color}, true);
                
                me.drawLine(child, max, surface, user);
            });
        }
    }
});