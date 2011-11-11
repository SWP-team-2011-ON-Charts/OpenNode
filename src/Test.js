/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


var login = function (server, serverResponse, authString) {

    var body = Ext.getBody();

    var button = Ext.widget('button', {
        text : 'Register datacenter',
        scale: 'medium',
        iconCls: 'add',
        renderTo: body,
    });
    
    var user_button = Ext.widget('button', {
        text : 'Add User',
        scale: 'medium',
        iconCls: 'add',
        renderTo: body,
        cls: 'add_user_button',
    });

    var switchLayout = Ext.widget('button', {
        text : 'Switch layout',
        scale: 'medium',
        iconCls: 'refresh',
        renderTo: body,
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
                fieldLabel: 'password',
                inputType:'password',
                value: 'demo',
                width: 200,
                listeners: {
                    specialkey: function(field, e){
                        if (e.getKey() == e.ENTER) {
                            me.syncWithNewServer(field.getValue(),
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
                    me.syncWithNewServer(register.items.getAt(0).getValue(),
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
            	xtype: 'textfield',
            	fieldLabel: 'Computers',
            	width: 250,
        	},{
                xtype: 'button',
                text: 'Add',
                handler: function() {
                    //store2.add({ 'name': register.items.getAt(0).getValue(),  "rights-status": register.items.getAt(1).getValue()});
                    
                    var user = Ext.ModelManager.create({name: register.items.getAt(0).getValue(), rights: register.items.getAt(1).getValue()}, 'User');
                    var user_computers = user.User_computer();
                    user_computers.add({
                        name: register.items.getAt(2).getValue()
                    });
                    store3.add(user);
                    
                    register.destroy();
               }
            }]
        });
        register.show();
    }, graph);

    switchLayout.setHandler(function() {
        var me = this,
            view = me.view;

        view.layoutPlugin.destroy();
        if (view.layoutPlugin instanceof Funcman.GraphLayout) {
            view.layoutPlugin = Ext.create('Funcman.GraphRoundLayout');
        } else {
            view.layoutPlugin = Ext.create('Funcman.GraphLayout');
        }
        view.plugins[0] = view.layoutPlugin;
        view.layoutPlugin.init(view);
        view.layoutPlugin.refresh();
    }, graph);
    
    graph.syncWithServer(server, serverResponse, authString);
}
