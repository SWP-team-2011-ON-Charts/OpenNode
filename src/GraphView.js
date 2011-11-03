Ext.define('Funcman.GraphView', {
    alias: 'GraphView',
    extend: 'Ext.Container',
    cls: 'graphview',
    overItemCls: 'x-view-over',
    
    /**
     * @cfg {Boolean} trackOver
     * True to enable mouseenter and mouseleave events
     */
    trackOver: false,
    
    isDragging: false,
    overItemCls: 'x-view-over',
    itemSelector: 'div.thumb-wrap',
    
    iconSize: 40,
    items_offscreen: [],
    items: [
        Ext.create('Ext.draw.Component', {
            viewBox: false,
            autoSize: true,
        })
    ],
    
    listeners: {
        selectionChange: function(dv, nodes) {
            var me = this.up().up();
            if (nodes.length != 0) {
                var layoutPlugin = me.view.plugins[0];
                layoutPlugin.refresh.call(layoutPlugin);
            }
        },
        mousedown: {fn: function(e,t,opts) {
        }, element: 'el'},
        mouseup: {fn: function() {
        }, element: 'el'},
        //mouseout: {fn: me.stopdrag, element: 'el'}
    },

    plugins : [Ext.create('Funcman.GraphLayout')],
    id: 'nodes',
    
    initComponent : function() {
        var me = this;
        me.callParent();
        
        me.layoutPlugin = me.plugins[0];
        me.draw = me.getComponent(0);

        me.on('mousedown', me.mousedownlistener, me, {element: 'el'});
        me.on('mouseup', me.stopdrag, me, {element: 'el'});
        
        if (me.overItemCls) {
            me.trackOver = true;
        }
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

    mousedownlistener: function(e, t, opts) {
        var me = this;
        if (me.isDragging)
            return;

        me.addCls('movecursor');
        me.on('mousemove', me.mousemovelistener, me, {element: 'el'});
        var containerpos = me.getPosition();
        var currentscroll = me.getEl().getScroll();
        me._pananchor = [e.getX() - containerpos[0] + currentscroll.left, e.getY() - containerpos[1] + currentscroll.top];
        me.isDragging = true;

        e.stopEvent();
    },

    stopdrag: function(e) {
        var me = this;

        if (!me.isDragging)
            return;

        me.removeCls('movecursor');
        me.removeListener('mousemove', me.mousemovelistener);
        me.isDragging = false;

        if (e.getTarget().id == me.getEl().id)
            me.setSelectedNode(null);
    },

    mousemovelistener: function(e, t, opts) {
        if (!this.isDragging)
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
            halfIcon = me.iconSize / 2,
            draw = me.draw,
            surface = draw.surface;

        // Clear all lines
        draw.surface.removeAll(true);
        draw.setSize(0, 0);

        // Connect nodes with their child nodes
        // Also find graph area
        me.items.each( function(item) {
            if (item instanceof Funcman.GraphNode) {
                var height = item.getHeight(),
                    x1 = item.getX() + item.getWidth() / 2,
                    y1 = item.getY() + height / 2;

                if (maxx < x1) maxx = x1;
                if (maxy < y1) maxy = y1;
                if (maxh < height) maxh = height;

                Ext.each(item.children, function(child) {
                    var x2 = child.getX() + child.getWidth() / 2,
                        y2 = child.getY() + child.getHeight() / 2;

                    // Create a path from the center of one icon to the center of the other
                    var path =
                      'M ' + x1 + ' ' + y1 + ' ' +
                      'L ' + x2 + ' ' + y2 + ' z';

                    surface.add({
                        type: 'path',
                        path: path,
                        stroke: "#0CC",
                        "stroke-width": '3',
                        opacity: 0.5,
                        group: 'lines'
                    });
                });
            }
        });

        surface.items.items.forEach( function(s){
            s.redraw();
        });

        // Set line drawing area
        draw.setSize(maxx + me.iconSize, maxy + maxh);
    }
});