// Copied largely from ux/DataView/Animated.js

Ext.define('Funcman.GraphRoundLayout', {

    defaults: {
        duration  : 200,
    },

    /**
     * Creates the plugin instance, applies defaults
     * @constructor
     * @param {Object} config Optional config object
     */
    constructor: function(config) {
        Ext.apply(this, config || {}, this.defaults);
    },

    // Initializes the plugin
    init: function(view) {
        this.view = view;
    },

    refresh: function () {
        this.updateCache();
        if (this.itemCacheSize == 0) {
            return;
        }

        if (!this.graph)
            this.graph = this.view.up();

        var zoom = this.graph.getZoom(),
            iconSize   = zoom * this.view.iconSize,
            itemWidth   = zoom * this.view.iconSize + 10,
            itemHeight  = iconSize + 40;

        //stores the current top and left values for each element (discovered below)
        var oldPositions = {},
            newPositions = {};

        // Get all root elements
        var roots = [];
        Ext.iterate(this.itemCache, function(id, item) {
            if (!item.parent) {
                roots.push(item);
            }
        }, this);

        // Recursive function to set new positions
        var setPos = function(child, left, top) {
            var chWidth = 0;

            if (!child.isCollapsed) {
                var nextTop = top + itemHeight * 1.4;
                Ext.each(child.children, function(chChild) {
                    chWidth += setPos(chChild, left + chWidth, nextTop);
                }, this);
            }

            newPositions[child.id] = {
                top : top,
                left: left + ((chWidth <= itemWidth) ? 0 : ((chWidth - itemWidth) / 2)),
                iconSize: iconSize
            };

            return chWidth ? chWidth : itemWidth;
        };

        // Set new positions
        var rootleft = 0;
        Ext.each(roots, function(root) {
            rootleft = setPos(root, rootleft, 0);
        }, this);

        // find current positions of each element,
        // don't animate if oldPos == newPos
        Ext.iterate(newPositions, function(id, newPos) {
            var item = this.itemCache[id],
                left = item.getX();
            if (Ext.Array.contains(this.added, id) || isNaN(left)) {
                // Convert to polar
                var scale = newPos.left/210.0;
                var x = newPos.top * Math.cos(scale) + 300,
                    y = newPos.top * Math.sin(scale) + 300;

                item.setXY(x, y);
                item.setIconSize(newPos.iconSize);
                delete newPositions[id];
            } else {
                oldPositions[id] = {left: left, top: item.getY(), iconSize: item.getIconSize()};
                var oldPos = oldPositions[id];
                if (left == newPos.left && oldPos.top == newPos.top && oldPos.iconSize == newPos.iconSize) {
                    delete newPositions[id];
                }
            }
        }, this);

        //do the movements
        var startTime  = new Date(),
            duration   = this.duration;

        var doAnimate = function() {
            var elapsed  = new Date() - startTime,
                fraction = elapsed / duration,
                graph = this.graph,
                zoom = graph.getZoom(),
                selectedNode = graph.getSelectedNode();
            
            if (fraction >= 1) {
                for (id in newPositions) {
                    var node = this.itemCache[id],
                        newPos = newPositions[id];

                    // Convert to polar
                    var scale = newPos.left/210.0;
                    var x = newPos.top * Math.cos(scale) + 300,
                        y = newPos.top * Math.sin(scale) + 300;
                        
                    node.setXY(x, y);
                    node.setIconSize(newPos.iconSize);
                }
                this.view.drawLines();

                Ext.TaskManager.stop(task);
                delete task;

            } else {
                //move each item
                for (id in newPositions) {
                    var oldPos  = oldPositions[id],
                        newPos  = newPositions[id],
                        oldTop  = oldPos.top,
                        oldLeft = oldPos.left,
                        oldSize = oldPos.iconSize;

                    // Convert to polar
                    var scale = oldLeft/210.0,
                        scale2 = newPos.left/210.0,
                        midScale  = scale + fraction * (scale2 - scale),
                        midTop = oldTop +  fraction * (newPos.top - oldTop);
                        x = midTop * Math.cos(midScale) + 300,
                        y = midTop * Math.sin(midScale) + 300;

                    var midSize = oldSize +  fraction * (newPos.iconSize - oldSize);

                    var node = this.itemCache[id];
                    node.setXY(midLeft, midTop);
                    //node.setIconSize(midSize);
                }
                this.view.drawLines();
            }
        };

        if (task) {
            Ext.TaskManager.stop(task);
            delete task;
        }

        var task = {
            run     : doAnimate,
            interval: 20,
            scope   : this
        };

        Ext.TaskManager.start(task);
    },

    updateCache: function() {
        var me = this;

        if (!me.itemCache) {
            me.itemCache = {};
            me.itemCacheSize = 0;
        }

        me.added = [];
        var items = me.view.itemcontainer.items,
            items_remove = me.view.items_remove;

        items.each(function(item) {
            var id = item.getId();
            if (me.itemCache[id] == undefined && !Ext.Array.contains(items_remove, item)) {

                // add item to the cache
                me.itemCache[id] = item;
                me.itemCacheSize++;
                me.added.push(id);

                // animate add
                var el = item.getEl();
                el.setStyle('opacity', 0);
                el.animate({to: {opacity: 1}});
            }
        }, me)
        
        Ext.iterate(me.itemCache, function(id, item) {
            if (Ext.Array.contains(items_remove, item)) {
                delete me.itemCache[id];
                me.itemCacheSize--;
            }
        });
    }
});