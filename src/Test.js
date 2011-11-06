/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


Ext.onReady(function () {

	
    var body = Ext.getBody();

    var button = Ext.widget('button', {
        text : 'Register datacenter',
        scale: 'medium',
        iconCls: 'add',
        renderTo: body,
        cls: 'floater',
    });
    
    var user_button = Ext.widget('button', {
        text : 'Add User',
        scale: 'medium',
        iconCls: 'user',
        renderTo: body,
        cls: 'add_user_button',
    });

    var graph = Ext.create('OpenNodeGraph', {
        renderTo: body,
    });

    graph.setHeight(600);
    graph.setWidth(900);

    button.setHandler(function() {
        var me = this;
        var register = Ext.create('Ext.Window', {
            title: 'Register datacenter',
            height: 200,
            width: 400,
            layout: 'vbox',
            items: [{
                xtype: 'textfield',
                fieldLabel: 'server',
                value: 'http://anthrax11.homeip.net:8080',
                width: 350
            }, {
                xtype: 'textfield',
                fieldLabel: 'username',
                value: 'opennode',
                width: 200
            }, {
                xtype: 'textfield',
                fieldLabel: 'server',
                value: 'demo',
                width: 200,
                listeners: {
                    specialkey: function(field, e){
                        if (e.getKey() == e.ENTER) {
                            me.syncWithServer(field.getValue(),
                                register.items.getAt(1).getValue(),
                                register.items.getAt(2).getValue());
                            register.destroy();
                        }
                    }
                }
            }, {
                xtype: 'button',
                text: 'register',
                handler: function() {
                    me.syncWithServer(register.items.getAt(0).getValue(),
                        register.items.getAt(1).getValue(),
                        register.items.getAt(2).getValue());
                    register.destroy();
                }
            }]
        });
        register.show();
    }, graph);
    
    user_button.setHandler(function() {
        var me = this;
        var register = Ext.create('Ext.Window', {
            title: 'Add User',
            height: 150,
            width: 300,
            layout: 'vbox',
            items: [{
                xtype: 'textfield',
                fieldLabel: 'User name',
                width: 250,
                
            }, {
                xtype: 'textfield',
                fieldLabel: 'Rights',
                width: 250,
            }, {
                xtype: 'button',
                text: 'Add',
                handler: function() {
                    store2.add({ 'name': register.items.getAt(0).getValue(),  "rights-status": register.items.getAt(1).getValue()});
                    register.destroy();
               }
            }]
        });
        register.show();
    }, graph);
    
    
});
