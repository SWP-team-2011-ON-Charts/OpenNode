/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


Ext.define('Users_computers', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'coumputer_name',      type: 'string'},
        {name: 'Read',      type: 'boolean', value: false},
        {name: 'Write',      type: 'boolean', value: false},
        {name: 'Execute',      type: 'boolean', value: false}
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

function set_icon(x){
	user_icon = x;
}

function get_icon(){
	return user_icon;
}


Ext.define('Funcman.UserPanel', {
    extend: 'Ext.grid.Panel',
	alias: 'UserPanel',
	curr_user: 'null',
    title: 'Users',
    user_icon: '../resources/images/different_users/user_black.png',
	

    store: Ext.create('Ext.data.Store', {
        storeId:'data_store3',
        fields:['id', 'name', 'rights-status'],
    }),
	listeners:{
        selectionchange: function(selectionModel, selected, options){
			this.curr_user = selected[0].data.id;
			
            this.up().view.layoutPlugin.view.drawLines();
        }
    },
    columns: [
          {text: 'Name',  dataIndex:'name'},
          {text: 'Rights',  dataIndex:'rights'},
          {text: 'mid',
              xtype:'actioncolumn', 
              width:70,
              items: [{
            	  //icon: store2.data.getAt(0)[0].icon,
                  icon: '../resources/images/different_users/user_black.png',
                  handler: function(grid, rowIndex, colIndex) { 
                	 
                      var rec = grid.getStore().getAt(rowIndex);
                      var appending_comp = '';
                      var selected_user = grid.store.findRecord('id', rec.get('id'));                      
                      var me = this;
                      
                    	  selected_user.User_computer().each(function(child_el){
                    		  appending_comp += child_el.get('name') + '\n' ;

                    		  
                    	  });                      
                      
                      var rights_window = Ext.create('Ext.window.Window', {
                    		title: 'User Rights',
                    		height: 250,
                    		width: 470,                    		
                    		layout: {
                    			type: 'table',
                    			columns: 2,
                    			},

                    		items: [{
                        			xtype: 'fieldcontainer',
                        			fieldLabel: 'Show this user',
                        			defaultType: 'checkboxfield',
                        			items: [{id  : 'checkbox4', image: '../resources/images/add.png'} ],
                    			},   {
                    		        xtype     : 'textareafield',
                    		        width: 250,
                    		        name      : 'computers',
                    		        fieldLabel: 'computers',
                    		        value: appending_comp,
                    				
                    		    },   {
                    		    	xtype: 'textfield',
                    		        width: 200,                    		        
                    		        name      : 'computers',
                    		        fieldLabel: 'Add computers',
                    		    }, {},  {
                    		    	xtype: 'fieldcontainer',
                    		        width: 200,                    		        
                    		        name      : 'computers',
                    		        fieldLabel: 'Add rights',
                    		        defaultType: 'checkboxfield',
                    		        
                    		        items: [{id  : 'checkbox1', boxLabel: 'Read',width: 80},
                    		                {id  : 'checkbox2', boxLabel: 'Write'},
                    		                {id  : 'checkbox3', boxLabel: 'Execute'}]
                        			
                    		    },{
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
                                        
                                    	selected_user.User_computer().add({
                                            
                                            name: rights_window.items.getAt(2).getValue()+rights,
											Read: read,
											Write: write,
											Execute: execute
                                        });

                                    	
                                    	appending_comp = ''
                                    	
                                  	  selected_user.User_computer().each(function(child_el){
                                		  appending_comp += child_el.get('name') + '\n' 
                                	  });

                                    	rights_window.items.getAt(1).setValue(appending_comp);
                                    	
                                    }
                                },{
                                    xtype: 'button',
                                    align: 'bottom',
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

        var user = Ext.ModelManager.create({name: 'Admin', rights: 'All'}, 'User');
        var user_computers = user.User_computer();
        user_computers.add({
            name: 'hostname_7 { r w e }',
            items: [{Read: 'true', Write: 'true', Execute: 'true'}],
        });

        user_computers.add({
            name: 'hostname_8 { r w e }'
        });

        me.store.add(user);
        
        me.on('render', function() {
            me.el.setStyle({left: me.up().width+'px'});
        }, me, {single: true});
    }
});