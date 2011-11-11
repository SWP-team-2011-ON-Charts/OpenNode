/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


/*
* Layout of the component:
* graph
*   view
*     nodecontainer
*       nodes
*     drawcomponent
*       lines
*   zoomslider
*   user panel
*/

var store3 = 	Ext.create('Ext.data.Store', {
    storeId:'data_store3',
    fields:['id', 'name', 'rights-status'],
    
});

Ext.define('Users_computers', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'coumputer_name',      type: 'string'}
    ]
});


Ext.define('User', {
	
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},    
        {name: 'name', type: 'string'},
        {name: 'rights', type: 'string'}
    ],
    hasMany: {model: 'Users_computers', name: 'User_computer'},
    
});

var user = Ext.ModelManager.create({name: 'Admin', rights: 'rw'}, 'User');
var user_computers = user.User_computer();
user_computers.add({
    name: 'vm0'
});

user_computers.add({
    name: 'vm1'
});

store3.add(user);

var user_icon = 'images/different_users/user_cyan.png';

function set_icon(x){
	user_icon = x;
}

function get_icon(){
	return user_icon;
}

var grid_panel = Ext.create('Ext.grid.Panel', {
	alias: 'grid_panel',
    title: 'Users',
    store: Ext.data.StoreManager.lookup('data_store3'),
    columns: [
          {text: 'Name',  dataIndex:'name'},
          {text: 'Rights',  dataIndex:'rights'},
          {text: 'mid',
              xtype:'actioncolumn', 
              width:70,
              dataIndex:'icon',
              items: [{
            	  //icon: store2.data.getAt(0)[0].icon,
                  icon: user_icon,
                  handler: function(grid, rowIndex, colIndex) { 
                	  
                      var rec = grid.getStore().getAt(rowIndex);
                      var appending_comp = '';
                      var selected_user = store3.findRecord('id', rec.get('id'));                      
                      
                    	  selected_user.User_computer().each(function(child_el){
                    		  appending_comp += child_el.get('name') + '\n' 
                    	  });                      
                      
                      var rights_window = Ext.create('Ext.window.Window', {
                    		title: 'User Rights',
                    		height: 300,
                    		width: 250,                    		
                    		layout: {
                    			type: 'table',
                    			columns:1
                    			},

                    		items: [{
                        			xtype: 'fieldcontainer',
                        			fieldLabel: 'Show this user',
                        			defaultType: 'checkboxfield',
                        			items: [{id  : 'checkbox1', image: 'add.png'} ],
                    			},   {
                    		        xtype     : 'textareafield',
                    		        width: 200,
                    		        name      : 'computers',
                    		        fieldLabel: 'computers',
                    		        value: appending_comp,
                    				
                    		    },   {
                    		    	xtype: 'textfield',
                    		        width: 200,                    		        
                    		        name      : 'computers',
                    		        fieldLabel: 'computers',
                    		        
                    				
                    		    }, {
                                    xtype: 'button',
                                    text: 'Add', handler: function(b) {
                                    	//set_icon('images/different_users/user_'+rights_window.items.getAt(1).getValue()+'.png');
                                    	//grid_panel.columns[2].items[0].icon = get_icon();
                                    	
                                    	selected_user.User_computer().add({
                                            name: rights_window.items.getAt(2).getValue()
                                        });
                                    	rights_window.destroy();
                                    }
                                },  {
                                    xtype: 'button',
                                    text: 'OK', handler: function(b) {
                                    	//set_icon('images/different_users/user_'+rights_window.items.getAt(1).getValue()+'.png');
                                    	//grid_panel.columns[2].items[0].icon = get_icon();
                                    	rights_window.destroy();
                                    	
                                    }
                                }
                    		]
                  	
                    	});
                      rights_window.show();
                  }
              },{
                  icon: 'images/list-remove.png',
                  tooltip: 'Delete',
                  handler: function(grid, rowIndex, colIndex) {
                      var rec = grid.getStore().getAt(rowIndex);
                      grid.getStore().remove(rec);
                  }                
              }
              
              ]
          }
          

      ],
    width: 274,
    height: 600,
    cls: 'userpanel',
});



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

        grid_panel,
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

        if (node.visible) {
            me.view.itemcontainer.add(node);
        }

        if (node.children) {
            me.addNodes(node.children, true);
        }

        if (!norefresh) {
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
            me.view.highlightItem.clearHighlight();
            me.view.highlightItem = null;
        }

        node.clearPathSprite();
        me.view.items_remove.push(node);
        
        // Disconnect from parent
        if (node.parent) {
            node.parent.removeChild(node);
            node.parent = null;
        }

        if (node.children) {
            me.removeNodes(node.children, true);
        }

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