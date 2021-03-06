/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.onReady(loginScreen = function() {
    var body = Ext.getBody();

    var regHandler = function() {
    	if (Ext.getCmp('server_field').getValue() != ''){
    		
	        var server = register.items.getAt(0).getValue();
	        //register.destroy();
	
	        register.setLoading(true);
	
	        // Username:password pair
	        var authString = 'Basic ' + Funcman.OpenNodeGraph.base64encode(
	            register.items.getAt(1).getValue() + ':' +
	            register.items.getAt(2).getValue());
	
	        Ext.Ajax.request({
	            cors: true,
	            url: server + '/computes/',
	            headers: {
	                'Authorization': authString
	            },
	            success: function(response, opts) {
	                register.destroy();
	                login(server, response.responseText, authString);
	            },
	            failure: function(response, opts) {
	                alert('Could not connect to management server '+opts.url);
	                register.setLoading(false);
	            }	        
	        });
    	}
    	else{
    		alert('Fill in atleast servers name');
    	}
    };

    var register = Ext.create('Ext.Window', {
        title: 'Login',
        height: 200,
        width: 400,
        layout: 'vbox',
        items: [{
            xtype: 'textfield',
            fieldLabel: 'server',
            value: 'http://anthrax11.homeip.net:8080',
            width: 350,
            margin: 3,
            id: 'server_field'
        }, {
            xtype: 'textfield',
            fieldLabel: 'username',
            value: 'opennode',
            width: 200,
            margin: 3,
            id: 'user_field'
        }, {
            xtype: 'textfield',
            fieldLabel: 'password',
            inputType:'password',
            value: 'demo',
            width: 200,
            margin: 3,
            listeners: {
                specialkey: function(field, e){
                    if (e.getKey() == e.ENTER) {
                        regHandler();
                    }
                }
            }
        }, {
            xtype: 'button',
            text: 'register',
            handler: regHandler,
            margin: 3
        }]
    });
    register.show();
});