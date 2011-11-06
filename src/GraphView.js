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
        {xtype: 'draw', viewBox: false, autoSize: true}
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

        //me.getSelectionModel().bindComponent(me);
    },

    getSelectionModel: function() {
        var me = this;

        if (!me.selModel) {
            me.selModel = Ext.create('Ext.selection.GraphViewModel');
            me.relayEvents(me.selModel, ['selectionchange']);
        }

        return me.selModel;
    },

    getSelectedItem: function() {
        return this.selectedItem;
    },

    setSelectedItem: function(item) {
        var me = this,
            zoom = me.up().zoom;

        if (item === me.selectedItem) {
            return;
        }

        if (me.selectedItem) {
            me.selectedItem.deselect(zoom < 2);
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
        body.on('mousemove', me.mousemovelistener, me, {element: 'el'});
        body.on('mouseup', me.mouseuplistener, me, {element: 'el'});

        var containerpos = me.getPosition();
        var currentscroll = me.getEl().getScroll();
        me._pananchor = [e.getX() - containerpos[0] + currentscroll.left, e.getY() - containerpos[1] + currentscroll.top];
        me.isMouseDown = true;

        e.stopEvent();
    },

    mouseuplistener: function(e,t) {
        var me = this,
            body = Ext.getBody();

        // If not dragging or migrating, then an item was selected
        if (!me.isDragging && !me.isMigrating) {
            me.setSelectedItem(me.getItemFromEl(t));
        }

        if (me.isMigrating) {
            me.isMigrating = false;
        }

        me.isMouseDown = false;
        me.isDragging = false;

        me.removeCls('movecursor');
        body.un('mousemove', me.mousemovelistener, me);
        body.un('mouseup', me.mouseuplistener, me);
        
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
            var el = this.getEl(),
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
            maxx = 0, maxy = 0, maxh = 0,
            draw = me.draw,
            surface = draw.surface;

        // Clear all lines
        surface.removeAll(true);
        draw.setSize(0, 0);

        // Connect nodes with their child nodes
        // Also find graph area
        me.itemcontainer.items.each( function(item) {
            var ic1 = item.getIconCenter(),
                height = item.getHeight();

            if (maxx < ic1.x) maxx = ic1.x;
            if (maxy < ic1.y) maxy = ic1.y;
            if (maxh < height) maxh = height;

            Ext.each(item.children, function(child) {
                var ic2 = child.getIconCenter();

                // Create a path from the center of one icon to the center of the other
                var path =
                  'M ' + ic1.x + ' ' + ic1.y + ' ' +
                  'L ' + ic2.x + ' ' + ic2.y + ' z',
                    color;

                if (child.type == "pm") {
                    color = "#0CC";
                } else {
                    color = "#C00";
                }

                surface.add({
                    type: 'path',
                    path: path,
                    stroke: color,
                    "stroke-width": '3',
                    opacity: 0.5,
                    group: 'lines'
                });
            });
        });

        surface.items.show(true);

        // Set line drawing area
        draw.setSize(maxx + me.iconSize, maxy + maxh);
    }
});