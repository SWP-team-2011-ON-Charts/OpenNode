/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/


var login = function (server, serverResponse, authString) {

    var body = Ext.getBody(),
        graphWidth = 850;

    var registerButton = Ext.widget('button', {
        text : 'Register datacenter',
        scale: 'medium',
        icon: '../resources/images/list-add.png'
    });

    var switchLayout = Ext.widget('button', {
        text : 'Switch layout',
        scale: 'medium',
        icon: '../resources/images/view-refresh.png'
    });

    var userButton = Ext.widget('button', {
        text : 'Add User',
        scale: 'medium',
        icon: '../resources/images/list-add.png',
        style: { margin: '0px 10px 0px '+(graphWidth-258)+'px' }
    });

    var helpButton = Ext.widget('button', {
        text : 'Help',
        scale: 'medium',
        icon: '../resources/images/help.png',
        style: { margin: '0px 10px 0px 36px' },
        handler: function() {
            window.open('../doc/Help.html');
        }
    });

    var logoutButton = Ext.widget('button', {
        text : 'Log out',
        scale: 'medium',
        icon: '../resources/images/logout.png'
    });

    var buttonContainer = Ext.create('Ext.container.Container', {
        items: [registerButton, switchLayout, userButton, helpButton, logoutButton],
        layout: 'hbox',
        defaults: {
            style: { margin: '0px 10px 5px 0px' }
        },
        renderTo: body
    });

    var graph = Ext.create('OpenNodeGraph', {
        renderTo: body,
        width: graphWidth,
        height: 600
    });

    registerButton.setHandler(function() {
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

    var user_id = 0;

    userButton.setHandler(function() {
        var me = this;
        var register = Ext.create('Ext.Window', {
            title: 'Add User',
            height: 120,
            width: 300,
            layout: 'vbox',
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Username',
                id: 'user_username',
                width: 250,
            }, {
                xtype: 'checkbox',
                boxLabel: 'Admin',
                id : 'user_isAdmin'
		    }, {
                xtype: 'button',
                text: 'Add',
                handler: function() {
                    user_id++;

                    var rights;
                    if (Ext.getCmp('user_isAdmin').getValue()){
                    	rights = 'All';
                    } else {
                    	rights = 'None';
                    }

                    if (Ext.getCmp('user_username').getValue() != ''){
                        var user = Ext.create('User', {id: user_id,
                            name: Ext.getCmp('user_username').getValue(),
                            rights: rights,
                            icon: '../resources/images/different_users/user_black.png'
                        });
                        graph.userpanel.store.add(user);
                        register.destroy();
                    }
                    else{
                    	alert('Please enter Username');
                    }
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

    logoutButton.setHandler(function() {
        graph.destroy();
        buttonContainer.destroy();
        loginScreen();
    });

    graph.syncWithServer(server, serverResponse, authString);
}
