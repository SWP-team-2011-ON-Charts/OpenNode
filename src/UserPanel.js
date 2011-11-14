/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


Ext.define('Funcman.ComputeRights', {
    alias: 'ComputeRights',
    extend: 'Ext.data.Model',
    fields: [
        {name: 'computer_id', type: 'string'},
        {name: 'computer_name', type: 'string'},
        {name: 'Read', type: 'string'},
        {name: 'Write', type: 'string'},
        {name: 'Execute', type: 'string'}
    ],
    belongsTo: 'Funcman.User'
});

Ext.define('Funcman.User', {
    alias: 'User',
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},    
        {name: 'name', type: 'string'},
        {name: 'rights', type: 'string'},
        {name: 'icon', type: 'string'}
    ],
    hasMany: {model: 'Funcman.ComputeRights', name: 'computes'},
});

Ext.define('Funcman.UserPanel', {
    extend: 'Ext.grid.Panel',
	alias: 'UserPanel',
	curr_user: null,
    title: 'Users',

    store: Ext.create('Ext.data.Store', {
        model: 'User',
        storeId:'users',
        proxy: {
            type: 'memory',
            reader: {
                type: 'json',
                root: 'users'
            }
        }
    }),
	listeners:{
        selectionchange: function(selectionModel, selected, options){
			this.curr_user = (selected.length == 0) ? null : selected[0];
			
            this.up().view.layoutPlugin.view.drawLines();
        }
    },
    columns: [
        {text: 'Name',  dataIndex:'name'},
        {text: 'Admin',  dataIndex:'rights',
            renderer: function(value) {
                if (value == 'All')
                    return 'yes';
                return 'no';
            },
        },
        {header: 'Actions',
            xtype:'actioncolumn', 
            width:70,
            renderer: function(value, metaData, record) {
              this.columns[2].items[0].icon = record.get('icon');
              return value;
            },
            xtype:'actioncolumn', 
            width:70,

            getRights: function(user) {
                var r = '';
                user.computes().each(function(compute) {
                    r += compute.get('computer_name') + ' {' ;
                    if (compute.get('Read') == 'true') {
                        r += 'r';
                    }
                    if (compute.get('Write') == 'true') {
                        r += 'w';
                    }
                    if (compute.get('Execute') == 'true') {
                        r += 'x';
                    }
                    r += '}\n' ;
                });
                return r;
            },

            getComputeData: function() {
                var computes = [],
                    items = this.up().up().up().view.itemcontainer.items.items;
                for (var item in items) {
                    item = items[item];
                    computes.push([item.id, item.params.name]);
                }
                return computes;
            },

              items: [{
            	  //icon: store2.data.getAt(0)[0].icon,
                  icon: '../resources/images/different_users/user_black.png',
                  handler: function(grid, rowIndex, colIndex) { 
                      var me = this,
                        rec = grid.getStore().getAt(rowIndex),
                        selected_user = grid.store.findRecord('id', rec.get('id'));
                      
                      var rights_window = Ext.create('Ext.window.Window', {
                    		title: 'User Rights for "' + selected_user.get('name') + '"',
                    		height: 350,
                    		width: 300,                    		
                    		layout: 'vbox',

                    		items: [{
                    		        xtype     : 'textareafield',
                    		        width: 250,
                    		        height: 120,
                    		        fieldLabel: 'computes',
                    		        value: this.getRights(selected_user),
                    				readOnly  : true
                    		    }, {
                    		    	xtype: 'combobox',
                    		        width: 250,
                    		        name: 'computer',
                    		        queryMode: 'local',
                    		        valueField: 'compute_id',
                                    displayField: 'compute_name',
                                    value: 'Select one...',
                    		        store: new Ext.data.ArrayStore({
                                        id: 0,
                                        fields: [
                                            'compute_id',
                                            'compute_name'
                                        ],
                                        data: me.getComputeData()
                                    }),
                    		        fieldLabel: 'Add compute',
                    		    }, {
                                    xtype: 'splitter'
                                }, {
                    		    	xtype: 'fieldcontainer',
                    		        width: 200,
                    		        fieldLabel: 'Add rights',
                    		        defaultType: 'checkboxfield',
                    		        
                    		        items: [{id  : 'checkbox1', boxLabel: 'Read',width: 80},
                    		                {id  : 'checkbox2', boxLabel: 'Write'},
                    		                {id  : 'checkbox3', boxLabel: 'Execute'}]
                        			
                    		    }, {
                                    xtype: 'button',
                                    text: 'Add', handler: function(b) {
                                    	//set_icon('images/different_users/user_'+rights_window.items.getAt(1).getValue()+'.png');
                                    	//grid_panel.columns[2].items[0].icon = get_icon();
                                        
                                    	
                                    	var checkbox1 = Ext.getCmp('checkbox1'),
	                                        checkbox2 = Ext.getCmp('checkbox2'),
	                                        checkbox3 = Ext.getCmp('checkbox3'),
											read = false,
											write = false,
											execute=false;
											
                                        var rights = ' {';
                                        if (checkbox1.getValue()){
                                        	rights += ' r ';
											read = true;
                                        }
                                        if (checkbox2.getValue()){
                                        	rights += ' w ';
											write = true;
                                        }
                                        if (checkbox3.getValue()){
                                        	rights += ' e '
											execute = true;
                                        }
                                        rights += '}';
                                        
                                        var cb = rights_window.items.getAt(1),
                                            compute_id = cb.getValue();
                                        
										var rights_defined = false;
										var pos_of_defined_rights = -1;
										var i = -1;
										selected_user.computes().each (function(compute) {
											i++;
											if(compute.get('computer_id')==compute_id) {
												rights_defined = true;
												pos_of_defined_rights=i;
											}
										});
										
										if (selected_user.computes() && compute_id!='') {
											if (rights_defined){selected_user.computes().removeAt(pos_of_defined_rights)};
											
											if (cb.findRecordByValue(compute_id)){
												selected_user.computes().add({
													computer_id: compute_id,
													computer_name: cb.findRecordByValue(compute_id).get('compute_name'),
													Read: read,
													Write: write,
													Execute: execute
												});
												
	                                    	rights_window.items.getAt(0).setValue(me.getRights(selected_user));
	                                    	rights_window.items.getAt(1).setValue('');
	                                    	me.up().up().up().view.layoutPlugin.refresh();}
											}
										else{
											alert('No item has been selected');
										}

                                    }
                                }, {
                                    xtype: 'splitter'
                                }, {
                                    xtype: 'button',
                                    align: 'bottom',
                                    scale: 'medium',
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
                  icon: '../resources/images/list-remove.png',
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
    
    initComponent: function() {
        var me = this;
        me.callParent();

        //super user
        var user = Ext.create('User', {id: 1, name: 'Opennode', rights: 'All', icon: '../resources/images/different_users/user_black.png'});
        var computes = user.computes();
        for (i = 0; i < 20; i++){
            computes.add({
                computer_id: 'dc0pm'+i,
                computer_name: 'hostname_'+i,
                Read: 'true', Write: 'true', Execute: 'true'
            });
        };

        me.store.add(user);
        
        //custom user
        var user2 = Ext.create('User', {id: 2, name: 'Custom user', rights: 'Custom', icon: '../resources/images/different_users/user_green.png'});
        var computes2 = user2.computes();
        computes2.add({
            computer_id: 'dc0pm6',
            computer_name: 'hostname_6',
            Read: 'true', Write: 'true', Execute: 'true'
        });

        computes2.add({
            computer_id: 'dc0pm8',
            computer_name: 'hostname_8',
            Read: 'true', Write: 'false', Execute: 'false'
        });
        
        computes2.add({
            computer_id: 'dc0pm2',
            computer_name: 'hostname_2',
            Read: 'true', Write: 'true', Execute: 'true'
        });

        me.store.add(user2);
        
        var user3 = Ext.create('User', {id: 3, name: 'Custom user 2', rights: 'None', icon: '../resources/images/different_users/user_cyan.png'});

        me.store.add(user3);
        
        me.on('render', function() {
            me.el.setStyle({left: me.up().width+'px'});
        }, me, {single: true});
    }
});