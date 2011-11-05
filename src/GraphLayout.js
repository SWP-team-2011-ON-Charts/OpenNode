// Copied largely from ux/DataView/Animated.js

Ext.define('Funcman.GraphLayout', {

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
/*
        var setPos = function(items, left, top) {
            var width = 0;
            
            setPos(item.children);
            
            if (item.visible) {
                var id = root.id;
                
                newPositions[id] = {
                    top : itemHeight * 2,
                    left: left + width,
                    iconSize: iconSize
                };
                if (Ext.Array.contains(this.added, id)) {
                    oldPositions[id] = newPositions[id];
                }

                width += itemWidth;
            }
            
            return width;
        };
        
        setPos(roots);
*/
        // Set new positions
        var rootleft = 0;
        Ext.each(roots, function(root) {
            var width = 0;
            Ext.each(root.children, function(child) {

                // Set positions for VMs (third line)
                var vmwidth = 0;
                Ext.each(child.children, function(vm) {
                    if (vm.visible) {
                        var id = vm.id;
                        newPositions[id] = {
                            top : itemHeight * 2,
                            left: rootleft + width + vmwidth,
                            iconSize: iconSize
                        };
                        vmwidth += itemWidth;
                    }
                }, this);

                var id = child.id;

                // Set position of PM
                newPositions[id] = {
                    top : itemHeight,
                    left: rootleft + width + ((vmwidth <= itemWidth) ? 0 : ((vmwidth - itemWidth) / 2)),
                    iconSize: iconSize
                };
                width += vmwidth ? vmwidth : itemWidth;
            }, this);

            // Place the root element in the middle
            var id = root.id;
            newPositions[id] = {left: rootleft + width / 2, top: 0, iconSize: iconSize};

            rootleft += width;
        }, this);

        //find current positions of each element
        Ext.iterate(this.itemCache, function(id, item) {
            if (Ext.Array.contains(this.added, id)) {
                oldPositions[id] = newPositions[id];
            } else {
                oldPositions[id] = {left: item.getX(), top: item.getY(), iconSize: item.getIconSize()};
                if (isNaN(oldPositions[id].left)) {
                    oldPositions[id] = newPositions[id];
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
                    node.setXY(newPos.left, newPos.top);
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
                        oldSize = oldPos.iconSize,

                        midTop  = oldTop + fraction * (newPos.top - oldTop),
                        midLeft  = oldLeft + fraction * (newPos.left - oldLeft),
                        midSize = oldSize +  fraction * (newPos.iconSize - oldSize);
                    
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