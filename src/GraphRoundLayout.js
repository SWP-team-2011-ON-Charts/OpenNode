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

        this.zoom = this.graph.getZoom();
        this.iconSize = this.zoom * this.view.iconSize;

        // Get all root elements
        var roots = [];
        Ext.iterate(this.itemCache, function(id, item) {
            if (!item.parent) {
                roots.push(item);
            }
        }, this);

        //stores the current left, top and iconSize values for each element (discovered below)
        this.oldPositions = {};
        this.newPositions = {};


        // Set new positions
        var rootleft = 300,
            minRootLeft = 10000,
            minRootTop = 10000;

        Ext.each(roots, function(root) {
            this.minLeft = 10000;
            this.minTop = 10000;
            this.maxLeft = -10000;

            this.setPositionRecursive(root, 0, 0, {left: rootleft, top: 100});
            rootleft += (this.maxLeft - this.minLeft) + 100;

            if (this.minLeft < minRootLeft) minRootLeft = this.minLeft;
            if (this.minTop < minRootTop) minRootTop = this.minTop;
        }, this);


        // find current positions of each element,
        // don't animate if oldPos == newPos
        Ext.iterate(this.newPositions, function(id, newPos) {
            var item = this.itemCache[id],
                left = item.getX();

            newPos.left -= minRootLeft;
            newPos.top -= minRootTop;

            if (Ext.Array.contains(this.added, id) || isNaN(left)) {
                item.setXY(newPos.left, newPos.top);
                item.setIconSize(newPos.iconSize);
                delete this.newPositions[id];
            } else {
                var oldPos = {left: left, top: item.getY(), iconSize: item.getIconSize()};
                if (left == newPos.left && oldPos.top == newPos.top && oldPos.iconSize == newPos.iconSize) {
                    delete this.newPositions[id];
                } else {
                    this.oldPositions[id] = oldPos;
                }
            }
        }, this);

        //do the movements
        this.startTime  = new Date();

        if (this.task) {
            Ext.TaskManager.stop(this.task);
            delete this.task;
        }

        this.task = {
            run     : this.doAnimate,
            interval: 20,
            scope   : this
        };

        Ext.TaskManager.start(this.task);
    },

    setPositionRecursive: function(item, angle, radius, rootPos) {
        var childCount = item.isCollapsed ? 0 : item.children.length,
            childAngle = (childCount <= 1) ? 0 : (2 * Math.PI / childCount),
            addAngle = (childCount % 2 == 0) ? (childAngle / 2) : 0,
            chAngle = angle + addAngle;

        if (childCount) {
            radius += 100 + childCount;
        }
        radius *= this.zoom;

        var newPos = {
            left: radius * Math.sin(angle) + rootPos.left,
            top: radius * Math.cos(angle) + rootPos.top,
            iconSize: this.iconSize
        };

        if (newPos.left < this.minLeft) this.minLeft = newPos.left;
        if (newPos.left > this.maxLeft) this.maxLeft = newPos.left;
        if (newPos.top < this.minTop) this.minTop = newPos.top;

        if (!item.isCollapsed) {
            var childRadius = (60 + childCount*2);

            var nextRadius = childRadius + 60 + childCount * 2;
            Ext.each(item.children, function(child) {
                chAngle = this.setPositionRecursive(child, chAngle + childAngle, childRadius, newPos);
            }, this);
        }
        
        this.newPositions[item.id] = newPos;

        return chAngle - addAngle;
    },

    doAnimate: function() {
        var elapsed  = new Date() - this.startTime,
            fraction = elapsed / this.duration,
            graph = this.graph,
            zoom = graph.getZoom(),
            oldPositions = this.oldPositions,
            newPositions = this.newPositions;
        
        if (fraction >= 1) {
            for (id in newPositions) {
                var node = this.itemCache[id],
                    newPos = newPositions[id];

                node.setXY(newPos.left, newPos.top);
                node.setIconSize(newPos.iconSize);
            }
            this.view.drawLines(curr_selected_user);

            Ext.TaskManager.stop(this.task);
            delete this.task;

        } else {
            //move each item
            for (id in newPositions) {
                var node = this.itemCache[id],
                    oldPos  = oldPositions[id],
                    newPos  = newPositions[id],
                    oldTop  = oldPos.top,
                    oldLeft = oldPos.left,
                    midLeft = oldLeft +  fraction * (newPos.left - oldLeft),
                    midTop = oldTop +  fraction * (newPos.top - oldTop);

                node.setXY(midLeft, midTop);

                var oldSize = oldPos.iconSize,
                    midSize = oldSize +  fraction * (newPos.iconSize - oldSize);
                node.setIconSize(midSize);
            }
            this.view.drawLines(curr_selected_user);
        }
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