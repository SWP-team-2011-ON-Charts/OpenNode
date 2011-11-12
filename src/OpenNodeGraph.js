/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.OpenNodeGraph', {
    extend: 'Funcman.Graph',
    alias: 'OpenNodeGraph',

    dcid: 0,

    attachInfoWindow: function(node) {
        var me = this,
            iw = Ext.create('NodeInfoWindow', { node: node });

        node.infowindow = iw;
        node.add(iw);
    },

    createDatacenter: function(path, authString, params) {
    	
        var dc = Ext.create('GraphNode', {
            id: 'dc'+params.id,
            params: params,
            path: path,
            type: 'dc',
            image: 'images/data-center.png',
            children: [],
            authString: authString
        });

        return dc;
    },

    createVM: function(pm, params) {
        var vm = Ext.create('GraphNode', {
            id: pm.id + 'vm'+params.id,
            params: params,
            path: pm.getRoot().path + 'computes/' + params.id + '/',
            type: 'vm',
            image: 'images/computer.png',
            parent: pm,
            children: []
        });
        this.attachInfoWindow(vm);
        pm.addChild(vm);

        return vm;
    },

    createMachineFromServer: function(path, params, dc) {
        var pm = Ext.create('GraphNode', {
            path: path,
            id: dc.id + 'pm'+params.id,
            type: 'pm',
            image: 'images/network-server.png',
            parent: dc,
            children: [],
            params: params
        });
        pm.params.network = 20;
        this.attachInfoWindow(pm);

        dc.addChild(pm);
        return pm;
    },

    syncWithServer: function(server, serverResponse, authString) {
        var me = this;

        me.view.setLoading(true);
        var dc = me.createDatacenter(server+'/', authString, {id: me.dcid, name: 'Datacenter '+me.dcid});
        me.dcid++;
        
        Ext.each(Ext.JSON.decode(serverResponse, true), function(m) {
            me.createMachineFromServer(server+'/computes/'+m.id+'/', m, dc);
        });
        me.addNode(dc);
        me.view.setLoading(false);
    },

    syncWithNewServer: function(server, username, password) {
        var me = this;
        me.view.setLoading(true);

        var authString = 'Basic ' + Funcman.OpenNodeGraph.base64encode(username + ':' + password);

        Ext.Ajax.request({
            cors: true,
            url: server + '/computes/',
            headers: {
                'Authorization': authString
            },
            success: function(response, opts) {
                me.syncWithServer(server, response.responseText, authString);
            },
            failure: function(response, opts) {
                alert('Could not connect to management server '+opts.url);
                me.view.setLoading(false);
            }
        });
    },

    getUniqueID: function(dc, callback, scope) {
        var me = this,
            id = 0;

        // Temporary fix, check only locally stored machines
        var foundId = false,
            items = me.view.itemcontainer.items.items;
        while (!foundId) {
            foundId = true;
            for (var item in items) {
                if (items[item].params.id == id) {
                    foundId = false;
                    id++;
                    break;
                }
            }
        }
        callback.call(scope, id);
        return;

        // Get the list of all computes and find an unused ID number
        Ext.Ajax.request({
            cors: true,
            url: dc.path + 'computes/',
            headers: {
                'Authorization': dc.authString
            },
            success: function(response) {
                var machines = Ext.JSON.decode(response.responseText, true),
                    foundId = false;
                while (!foundId) {
                    foundId = true;
                    for (var m in machines) {
                        if (machines[m].id == id) {
                            foundId = false;
                            id++;
                            break;
                        }
                    }
                }
                callback.call(scope, id);
            },
            failure: function(response, opts) {
                callback.call(scope, id);
            }
        });
    },

    statics: {
        base64encode: function(decStr){
            if (typeof btoa === 'function') {
                 return btoa(decStr);            
            }
            var base64s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
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
        }
    }
});