Ext.define('Funcman.GraphView', {
    alias: 'GraphView',
    extend: 'Ext.Container',
    cls: 'graphview',

    isMouseDown: false,
    isDragging: false,
    
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
        me.on('mouseup', me.mouseuplistener, me, {element: 'el'});
    },

    afterRender: function() {
        this.callParent(arguments);

        // Init the SelectionModel after any on('render') listeners have been added.
        // Drag plugins create a DragDrop instance in a render listener, and that needs
        // to see an itemmousedown event first.
        this.getSelectionModel().bindComponent(this);
    },

    getSelectionModel: function() {
        var me = this;

        if (!me.selModel) {
            me.selModel = Ext.create('Ext.selection.GraphViewModel');
            me.relayEvents(me.selModel, ['selectionchange']);
        }

        return me.selModel;
    },

    getItemFromEl: function(el) {
        while (el) {
            var item = Ext.ComponentManager.get(el.id);
            if (item instanceof Funcman.GraphNode) {
                return item;
            } else if (!item) {
                return null;
            }
            el = el.parentElement;
        }
        return null;
    },

    highlightlistener: function(e, t, opts) {
        if (t === this.highlightEl) {
            return;
        }
    
        item = this.getItemFromEl(t);
        if (item && item !== this.highlightItem) {
            if (this.highlightItem) {
                this.highlightItem.clearHighlight();
            }
            this.highlightItem = item;
            this.highlightEl = t;
            item.highlight();
        } else if (!item) {
            if (this.highlightItem) {
                this.highlightItem.clearHighlight();
                this.highlightItem = null;
                this.highlightEl = null;
            }
        }
    },

    mousedownlistener: function(e, t, opts) {
        var me = this;
        if (me.isDragging)
            return;

        me.addCls('movecursor');
        me.on('mousemove', me.mousemovelistener, me, {element: 'el'});
        var containerpos = me.getPosition();
        var currentscroll = me.getEl().getScroll();
        me._pananchor = [e.getX() - containerpos[0] + currentscroll.left, e.getY() - containerpos[1] + currentscroll.top];
        me.isMouseDown = true;

        e.stopEvent();
    },

    mouseuplistener: function(e,t) {
        var me = this,
            zoom = me.up().zoom;

        if (!me.isDragging) {
            // If not dragging, then an item was selected
            var item = me.getItemFromEl(t);
            if (item && item !== this.selectedItem) {
                if (this.selectedItem) {
                    this.selectedItem.deselect(zoom < 2);
                }
                this.selectedItem = item;
                item.select();
            } else if (!item) {
                if (this.selectedItem) {
                    this.selectedItem.deselect(zoom < 2);
                    this.selectedItem = null;
                }
            }
        }

        me.isMouseDown = false;
        me.isDragging = false;

        me.removeCls('movecursor');
        me.removeListener('mousemove', me.mousemovelistener);
        
        e.stopEvent();
    },

    mousemovelistener: function(e, t, opts) {
        var me = this;

        if (me.isMouseDown) {
            me.isDragging = true;
        }
    
        if (!me.isDragging)
            return;

        var el = this.getEl(),
            currentpos = e.getXY(),
            containerpos = this.getPosition();
        el.scrollTo("right", (containerpos[0] + this._pananchor[0] - currentpos[0]));
        el.scrollTo("top", (containerpos[1] + this._pananchor[1] - currentpos[1]));
        e.stopEvent();
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
        draw.setSize(maxx + me.iconSize, maxy + maxh + 100);
    }
});