// Copied largely from ux/DataView/Animated.js

Ext.define('Funcman.GraphLayout', {

    defaults: {
        duration  : 200,
        idProperty: 'id'
    },

    /**
     * Creates the plugin instance, applies defaults
     * @constructor
     * @param {Object} config Optional config object
     */
    constructor: function(config) {
        Ext.apply(this, config || {}, this.defaults);
    },

    /**
     * Initializes the transition plugin. Overrides the dataview's default refresh function
     * @param {Ext.view.View} dataview The dataview
     */
    init: function(dataview) {
        /**
         * @property dataview
         * @type Ext.view.View
         * Reference to the DataView this instance is bound to
         */
        this.dataview = dataview;
        
        var idProperty = this.idProperty,
            store = dataview.store;

        dataview.blockRefresh = true;
        dataview.updateIndexes = Ext.Function.createSequence(dataview.updateIndexes, function() {
            this.getTargetEl().select(this.itemSelector).each(function(element, composite, index) {
                element.id = element.dom.id = Ext.util.Format.format("{0}-{1}", dataview.id, store.getAt(index).internalId);
            }, this);
        }, dataview);
        
        /**
         * @property dataviewID
         * @type String
         * The string ID of the DataView component. This is used internally when animating child objects
         */
        this.dataviewID = dataview.id;
        
        /**
         * @property cachedStoreData
         * @type Object
         * A cache of existing store data, keyed by id. This is used to determine
         * whether any items were added or removed from the store on data change
         */
        this.cachedStoreData = {};
        
        //catch the store data with the snapshot immediately
        this.cacheStoreData(store.data || store.snapshot);

        dataview.on('resize', function() {
            var store = dataview.store;
            if (store.getCount() > 0) {
                // reDraw.call(this, store);
            }
        }, this);
        
        this.reDraw = function (store) {
            if (this.suspendEvents) {
                return;
            }
        
            var parentEl = dataview.getTargetEl(),
                calcItem = store.getAt(0),
                added    = this.getAdded(store),
                removed  = this.getRemoved(store),
                previous = this.getRemaining(store),
                existing = Ext.apply({}, previous, added);
            
            //hide old items
            Ext.each(removed, function(item) {
                var id = this.dataviewID + '-' + item.internalId;
                if (Ext.fly(id)) {
                    Ext.fly(id).animate({
                        remove  : false,
                        duration: duration,
                        opacity : 0,
                        useDisplay: true,
                        callback: function() {
                            Ext.fly(id).setDisplayed(false);
                        }
                    });
                }
            }, this);

            this.cacheStoreData(store);
            
            //store is empty
            if (calcItem == undefined) {
                return;
            }
            
            var el = Ext.get(this.dataviewID + "-" + calcItem.internalId);
            
            //if there is nothing rendered, force a refresh and return. This happens when loading asynchronously (was not
            //covered correctly in previous versions, which only accepted local data)
            if (!el) {
                dataview.refresh();
                return true;
            }
            
            var graph = this.dataview.up().up();
            var itemWidth   = graph.getZoom() * graph.iconSize,// el.getWidth(),// + el.getMargin('lr'),
                itemHeight  = graph.getZoom() * graph.iconSize + 20; // el.getHeight(); // el.getMargin('tb')
            
            //stores the current top and left values for each element (discovered below)
            var oldPositions = {},
                newPositions = {},
                elCache      = {};
            
            //find current positions of each element and save a reference in the elCache
            Ext.iterate(existing, function(itemid, item) {
                var id = item.internalId;
                elCache[id] = Ext.get(this.dataviewID + '-' + id);
                oldPositions[id] = {left: item.get('x'), top: item.get('y')};
            }, this);
            
            //make sure the correct styles are applied to the parent element
            parentEl.applyStyles({
                display : 'block',
                position: 'relative'
            });

            // Get all datacenters (root elements)
            var dcs = [];
            Ext.iterate(store.data.items, function(record) {
                if (!record.get('parent')) {
                    dcs.push(record);
                }
            }, this);

            // Set new positions
            var rootleft = 0;
            Ext.each(dcs, function(dc) {
                var width = 0;
                Ext.each(dc.children, function(child) {
                    var id = child.internalId;

                    // Set positions for VMs (third line)
                    var vmwidth = 0;
                    Ext.each(child.children, function(vm) {
                        var vmid = vm.internalId;
                        newPositions[vmid] = {
                            top : itemHeight * 2,
                            left: rootleft + width + vmwidth
                        };
                        if (oldPositions[vmid].left === 0 && oldPositions[vmid].top === 0) {
                            oldPositions[vmid] = newPositions[vmid];
                        }
                        this.suspendEvents = true;
                        vm.set('x', newPositions[vmid].left);
                        vm.set('y', newPositions[vmid].top);
                        this.suspendEvents = false;

                        vmwidth += itemWidth;
                    }, this);

                    // Set position of PM
                    newPositions[id] = {
                        top : itemHeight,
                        left: rootleft + width + ((vmwidth <= itemWidth) ? 0 : ((vmwidth - itemWidth) / 2))
                    };
                    if (oldPositions[id].left === 0 && oldPositions[id].top === 0) {
                        oldPositions[id] = newPositions[id];
                    }
                    this.suspendEvents = true;
                    child.set('x', newPositions[id].left);
                    child.set('y', newPositions[id].top);
                    this.suspendEvents = false;

                    width += vmwidth ? vmwidth : itemWidth;
                }, this);

                // Place the root element in the middle
                var id = dc.internalId;
                newPositions[id] = {left: rootleft + width / 2, top: 0};
                if (oldPositions[id].left === 0 && oldPositions[id].top === 0) {
                    oldPositions[id] = newPositions[id];
                }
                this.suspendEvents = true;
                dc.set('x', newPositions[id].left);
                dc.set('y', newPositions[id].top);
                this.suspendEvents = false;
                
                rootleft += width;
            }, this);

            //do the movements
            var startTime  = new Date(),
                duration   = this.duration,
                dataviewID = this.dataviewID;
            
            var doAnimate = function() {
                if (!this.graph)
                    this.graph = this.dataview.up().up();
            
                var elapsed  = new Date() - startTime,
                    fraction = elapsed / duration;
                
                if (fraction >= 1) {
                    for (id in newPositions) {
                        Ext.fly(dataviewID + '-' + id).applyStyles({
                            top : newPositions[id].top + "px",
                            left: newPositions[id].left + "px"
                        });

                        var node = this.cachedStoreData[id],
                            iw = node.infowindow;
                        if (iw) {
                            iw.setPosition(node.get('x'), node.get('y') + itemHeight);
                            if (this.graph.getZoom() > 2 || node === this.graph.getSelectedNode()) {
                                iw.show();
                            } else {
                                iw.hide();
                            }
                        }
                    }
                    
                    Ext.TaskManager.stop(task);
                    delete task;
                    
                } else {
                    //move each item
                    for (id in newPositions) {
                        if (!previous[id]) {
                            continue;
                        }
                        
                        var oldPos  = oldPositions[id],
                            newPos  = newPositions[id],
                            oldTop  = oldPos.top,
                            newTop  = newPos.top,
                            oldLeft = oldPos.left,
                            newLeft = newPos.left,
                            diffTop = fraction * Math.abs(oldTop  - newTop),
                            diffLeft= fraction * Math.abs(oldLeft - newLeft),
                            midTop  = oldTop  > newTop  ? oldTop  - diffTop  : oldTop  + diffTop,
                            midLeft = oldLeft > newLeft ? oldLeft - diffLeft : oldLeft + diffLeft;
                        
                        Ext.fly(dataviewID + '-' + id).applyStyles({
                            top : midTop + "px",
                            left: midLeft + "px"
                        }).setDisplayed(true);

                        var node = this.cachedStoreData[id],
                            iw = node.infowindow;
                        if (iw) {
                            iw.setPosition(midLeft, midTop + itemHeight);
                            if (this.graph.getZoom() > 2 || node === this.graph.getSelectedNode()) {
                                iw.show();
                            } else {
                                iw.hide();
                            }
                        }
                    }
                    this.graph.connecticons.call(this.graph);
                }
            };
            
            var task = {
                run     : doAnimate,
                interval: 20,
                scope   : this
            };
            
            Ext.TaskManager.start(task);

            //show new items
            Ext.iterate(added, function(id, item) {
                Ext.fly(this.dataviewID + '-' + item.internalId).applyStyles({
                    top    : newPositions[item.internalId].top + "px",
                    left   : newPositions[item.internalId].left + "px"
                }).setDisplayed(true);
                
                Ext.fly(this.dataviewID + '-' + item.internalId).animate({
                    remove  : false,
                    duration: duration,
                    opacity : 1
                });
            }, this);

            this.cacheStoreData(store);
        }
        
        this.suspendEvents = false;
        dataview.store.on('datachanged', this.reDraw, this);
        
        this.refresh = function() {
            var me = this;
            me.cacheStoreData(store);

            if (!me.graph)
                me.graph = me.dataview.up().up();
            
            me.suspendEvents = true;
            Ext.iterate(me.cachedStoreData, function(id, item) {
                item.set('icon_size', me.graph.iconSize * me.graph.getZoom());
            }, me);
            me.suspendEvents = false;

            me.reDraw.call(me, store);
        };
    },
    
    /**
     * Caches the records from a store locally for comparison later
     * @param {Ext.data.Store} store The store to cache data from
     */
    cacheStoreData: function(store) {
        this.cachedStoreData = {};
        
        store.each(function(record) {
             this.cachedStoreData[record.internalId] = record;
        }, this);
    },
    
    /**
     * Returns all records that were already in the DataView
     * @return {Object} All existing records
     */
    getExisting: function() {
        return this.cachedStoreData;
    },
    
    /**
     * Returns the total number of items that are currently visible in the DataView
     * @return {Number} The number of existing items
     */
    getExistingCount: function() {
        var count = 0,
            items = this.getExisting();
        
        for (var k in items) {
            count++;
        }
        
        return count;
    },
    
    /**
     * Returns all records in the given store that were not already present
     * @param {Ext.data.Store} store The updated store instance
     * @return {Object} Object of records not already present in the dataview in format {id: record}
     */
    getAdded: function(store) {
        var added = {};
        
        store.each(function(record) {
            if (this.cachedStoreData[record.internalId] == undefined) {
                added[record.internalId] = record;
            }
        }, this);
        
        return added;
    },
    
    /**
     * Returns all records that are present in the DataView but not the new store
     * @param {Ext.data.Store} store The updated store instance
     * @return {Array} Array of records that used to be present
     */
    getRemoved: function(store) {
        var removed = [],
            id;
        
        for (id in this.cachedStoreData) {
            if (store.findBy(function(record) {return record.internalId == id;}) == -1) {
                removed.push(this.cachedStoreData[id]);
            }
        }
        
        return removed;
    },
    
    /**
     * Returns all records that are already present and are still present in the new store
     * @param {Ext.data.Store} store The updated store instance
     * @return {Object} Object of records that are still present from last time in format {id: record}
     */
    getRemaining: function(store) {
        var remaining = {};

        store.each(function(record) {
            if (this.cachedStoreData[record.internalId] != undefined) {
                remaining[record.internalId] = record;
            }
        }, this);
        
        return remaining;
    }
});
