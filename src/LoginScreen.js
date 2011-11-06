Ext.onReady(function() {
    var body = Ext.getBody();

    var base64encode = function(decStr){
        if (typeof btoa === 'function') {
             return btoa(decStr);            
        }
        var base64s = this.base64s;
        var bits;
        var dual;
        var i = 0;
        var encOut = "";
        while(decStr.length >= i + 3){
            bits = (decStr.charCodeAt(i++) & 0xff) <<16 | (decStr.charCodeAt(i++) & 0xff) <<8 | decStr.charCodeAt(i++) & 0xff;
            encOut += base64s.charAt((bits & 0x00fc0000) >>18) + base64s.charAt((bits & 0x0003f000) >>12) + base64s.charAt((bits & 0x00000fc0) >> 6) + base64s.charAt((bits & 0x0000003f));
        }
        if(decStr.length -i > 0 && decStr.length -i < 3){
            dual = Boolean(decStr.length -i -1);
            bits = ((decStr.charCodeAt(i++) & 0xff) <<16) |    (dual ? (decStr.charCodeAt(i) & 0xff) <<8 : 0);
            encOut += base64s.charAt((bits & 0x00fc0000) >>18) + base64s.charAt((bits & 0x0003f000) >>12) + (dual ? base64s.charAt((bits & 0x00000fc0) >>6) : '=') + '=';
        }
        return(encOut);
    };

    var regHandler = function() {
        var server = register.items.getAt(0).getValue(),
            username = register.items.getAt(1).getValue(),
            password = register.items.getAt(2).getValue();
        //register.destroy();

        register.setLoading(true);

        Ext.Ajax.request({
            cors: true,
            url: server + '/computes/',
            headers: {
                'Authorization': 'Basic ' + base64encode(username + ':' + password)
            },
            success: function(response, opts) {
                register.destroy();
                login(server, response.responseText);
            },
            failure: function(response, opts) {
                alert('Could not connect to management server '+opts.url);
                register.setLoading(false);
            }
        });
        delete password;
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
            margin: 3
        }, {
            xtype: 'textfield',
            fieldLabel: 'username',
            value: 'opennode',
            width: 200,
            margin: 3
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