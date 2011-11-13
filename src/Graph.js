/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


Ext.define('Funcman.Graph', {
    alias: 'Graph',
    extend: 'Ext.container.Container',
    cls: 'graphcontainer',

    zoomMinLevel: 0.5,
    zoomMaxLevel: 2.0,
    zoomOutLevel: 1.0,
    zoomInLevel: 1.5,

    items: [
        Ext.create('Funcman.GraphView'),
        Ext.create('Ext.slider.Single', {
            height: 60,
            increment: 1,
            vertical: true,
            cls: 'graphzoomslider',
            listeners: {
                change: function(el, val) {
                    var me = this.up(),
                        oldZoom = me.zoom,
                        zoom = me.getZoom();

                    // If a transition occurs
                    if ((oldZoom <= me.zoomInLevel && zoom > me.zoomInLevel) ||
                        (oldZoom > me.zoomInLevel && zoom <= me.zoomInLevel) ||
                        (oldZoom <= me.zoomOutLevel && zoom > me.zoomOutLevel) ||
                        (oldZoom > me.zoomOutLevel && zoom <= me.zoomOutLevel)) {
                        me.updateZoomLevel();
                    }

                    me.view.layoutPlugin.refresh();
                }
            }
        }),
        Ext.create('Funcman.UserPanel')
    ],

    updateZoomLevel: function() {
        this.updateInfoWindowShow(this.getZoom() > this.zoomInLevel);
        this.updateNameShow(this.zoom > this.zoomOutLevel);
    },

    updateInfoWindowShow: function(show) {
        var me = this,
            items = me.view.itemcontainer.items;

        // Show/hide infowindow on zoom transition
        if (show) {
            items.each(function(item) {
                item.showInfoWindow();
            });
        } else {
            var selected = me.getSelectedNode();
            items.each(function(item) {
                if (item !== selected) {
                    item.hideInfoWindow();
                }
            });
        }
    },

    updateNameShow: function(show) {
        var me = this,
            items = me.view.itemcontainer.items;

        // Show/hide infowindow on zoom transition
        if (show) {
            items.each(function(item) {
                item.showName();
            });
        } else {
            var selected = me.getSelectedNode();
            items.each(function(item) {
                if (item !== selected) {
                    item.hideName();
                }
            });
        }
    },

    // Mouse wheel controls the zoom slider
    mousewheellistener: function(e, t, opts) {
        this.slider.setValue(this.slider.getValue() + e.getWheelDelta());
        e.stopEvent();
    },

    initComponent: function() {
        var me = this;
        me.callParent();

        // Create shortcuts to subelements
        me.view = me.items.getAt(0);
        me.slider = me.items.getAt(1);
        me.userpanel = me.items.getAt(2);

        me.slider.setMinValue(me.zoomMinLevel * 10);
        me.slider.setMaxValue(me.zoomMaxLevel * 10);
        me.slider.setValue((me.zoomMaxLevel - me.zoomMinLevel) * 9);

        me.on('mousewheel', me.mousewheellistener, me, {element: 'el'});
    },

    getSelectedNode: function() {
        return this.view.getSelectedItem();
    },

    setSelectedNode: function(node) {
        this.view.setSelectedItem(node);
    },

    getZoom: function() {
        this.zoom = this.slider.getValue() / 10.0;
        return this.zoom;
    },

    addNode: function(node, norefresh) {
        var me = this;

        me.view.itemcontainer.add(node);
        me.addNodes(node.children, true);

        if (!norefresh) {
            // Check if the new node is under a collapsed node
            var n = node;
            while (n.parent) {
                if (n.isCollapsed) {
                    node.hide();
                    break;
                }
                n = n.parent;
            }

            me.updateZoomLevel();
            me.view.layoutPlugin.refresh();
        }
    },
    
    addNodes: function(nodes, norefresh) {
        var me = this;

        Ext.each(nodes, function(node) {
            me.addNode(node, true);
        });

        if (!norefresh) {
            me.updateZoomLevel();
            me.view.layoutPlugin.refresh();
        }
    },

    removeNode: function(node, norefresh) {
        var me = this,
            el = node.getEl();

        if (node === me.getSelectedNode()) {
            me.setSelectedNode(null);
        }

        if (node === me.view.highlightItem) {
            node.clearHighlight();
            me.view.highlightItem = null;
        }

        node.clearPathSprite();
        me.view.items_remove.push(node);
        
        // Disconnect from parent
        if (node.parent) {
            node.parent.removeChild(node);
            node.parent = null;
        }

        me.removeNodes(node.children, true);

        if (!norefresh) {
            me.updateZoomLevel();
            me.view.layoutPlugin.refresh();
        }

        node.hideInfoWindow();

        el.setStyle({opacity: 1});
        el.animate({to: {opacity: 0}, callback: function() {
            me.remove(node);
            Ext.Array.remove(me.view.items_remove, node);
            node.destroy();
        }});
    },

    removeNodes: function(nodes, norefresh) {
        var me = this;

        // Can't remove while doing for-each, just remove until empty.
        while (nodes.length != 0) {
            me.removeNode(nodes.pop(), true);
        }

        if (!norefresh) {
            me.updateZoomLevel();
            me.view.layoutPlugin.refresh();
        }
    },
});
