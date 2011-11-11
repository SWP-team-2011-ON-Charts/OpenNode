/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.OpenNodeGraph', {
    extend: 'Funcman.Graph',
    alias: 'OpenNodeGraph',

    dcid: 0, vmid: 0,

    initComponent: function() {
        var me = this;
        me.callParent();
        
        Ext.define('UsageData', {
            extend: 'Ext.data.Model',
            fields: ['usage', 'utype']
        });

        Ext.define('Ext.chart.theme.Usage', {
            extend: 'Ext.chart.theme.Base',

            constructor: function(config) {
                this.callParent([Ext.apply({
                    axis: {
                        'stroke-width': 0
                    },
                    axisLabelBottom: {
                        renderer: function(v) { return ''; }
                    },
                    axisLabelLeft: {
                        renderer: function(v) { return ''; }
                    },
                }, config)]);
            }
        });
    },

    attachInfoWindow: function(node) {
        var me = this;

        var iw = Ext.create('NodeInfoWindow', { node: node });

        node.infowindow = iw;
        node.add(iw);
    },

    createDatacenter: function(path, res_id, name) {
    	
        var dc = Ext.create('GraphNode', {
            id: 'dc'+res_id,
            res_id: res_id,
            path: path,
            type: 'dc',
            name : name,
            image: 'images/data-center.png',
            children: []
        });

        return dc;
    },

    createVM: function(path, res_id, name, pm) {
        var vm = Ext.create('GraphNode', {
            id: pm.id + 'vm'+res_id,
            res_id: res_id,
            path: path,
            type: 'vm',
            name : name,
            image: 'images/computer.png',
            parent: pm,
            children: []
        });
        //this.attachInfoWindow(vm);
        pm.addChild(vm);

        return vm;
    },

    addMachine: function(button) {
        var node = button.node;
        var newid = node.get('id')+'pm'+this.pmid;
        
        var pm = Ext.create('GraphNode', {
            id: newid,
            idnum: this.pmid,
            type: 'pm',
            name : 'Machine ' + this.pmid,
            image: 'images/network-server.png',
            top: 64,
            left: this.pmid * 64,
            parent: node
        });
        this.attachInfoWindow(pm);
        pm.children = [];

        node.addChild(pm);

        this.addNode(pm);
        this.pmid++;
    },

    addVM: function(button) {
        var node = button.node;
        var newid = node.get('id')+'vm'+this.vmid;

        var vm = Ext.create('GraphNode', {
            path: null,
            id: newid,
            res_id: this.vmid,
            type: 'vm',
            name : 'VM ' + this.vmid,
            image: 'images/computer.png',
            top: 128,
            left: this.vmid * 64,
            parent: node
        });
        this.attachInfoWindow(vm);
        vm.children = [];

        node.addChild(vm);
        
        this.addNode(vm);
        //this.setSelectedNode(vm);
        this.vmid++;
    },

    removeListener: function(button, e) {
        var me = this,
            node = button.node,
            path = node.get('path');

        if (!path) {
            me.removeNode(button.node);
            return;
        }

        Ext.Ajax.request({
            cors: true,
            method: 'DELETE',
            url: path,
            success: function(response, opts) {
                me.removeNode(button.node);
            },
            failure: function(response, opts) {
                alert('Could not connect to management server '+opts.url);
            }
        });
    },

    createMachineFromServer: function(path, params, dc) {
        var pm = Ext.create('GraphNode', {
            path: path,
            id: dc.id + 'pm'+params.id,
            res_id: params.id,
            type: 'pm',
            name: params.name,
            image: 'images/network-server.png',
            parent: dc,
            children: [],
            cpu: params.cpu,
            memory: params.memory,
        });
        this.attachInfoWindow(pm);

        dc.addChild(pm);
        return pm;
    },

    base64encode: function(decStr){
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
    },

    syncWithServer: function(server, serverResponse) {
        var me = this;

        me.view.setLoading(true);
        var dc = me.createDatacenter(server+'/networks/'+me.dcid+'/', me.dcid, 'datacenter'+me.dcid);
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

        Ext.Ajax.request({
            cors: true,
            url: server + '/computes/',
            headers: {
                'Authorization': 'Basic ' + me.base64encode(username + ':' + password)
            },
            success: function(response, opts) {
                me.syncWithServer(server, response.responseText);
            },
            failure: function(response, opts) {
                alert('Could not connect to management server '+opts.url);
                me.view.setLoading(false);
            }
        });
    },

    getComputeInfo: function(button, e) {
        var me = this;
        var node = button.node;

        var infocontainer = node.infowindow.items.getAt(3);

        Ext.Ajax.request({
            cors: true,
            url: node.get('path'),
            success: function(response, opts) {
                var o = Ext.JSON.decode(response.responseText, true);
                var text = '';
                for(var i in o) {
                    if (i == "arch") {
                        infocontainer.add({xtype: 'label', text: 'Arch: '+o[i]});
                    } else if (i == "state") {
                        var statusButton = Ext.create('Ext.Button', {
                            xtype: 'button',
                            text: o[i],
                            scale: 'medium',
                            node: node
                        });
                        statusButton.setHandler(me.statusButtonListener, me);
                        infocontainer.add(statusButton);
                    }
                    text += i+': '+o[i]+'\n';
                }
            },
            failure: function(response, opts) {
                alert('Could not connect to management server '+opts.url);
            }
        });
    },
    
    statusButtonListener: function(button, e) {
        var me = this;
        var node = button.node;

        var newStatus = (button.getText() == 'running') ? 'stopped' : 'running';

        Ext.Ajax.request({
            cors: true,
            method: 'PUT',
            jsonData: {status: newStatus},
            url: node.get('path'),
            success: function(response, opts) {
                button.setText(newStatus);
            },
            failure: function(response, opts) {
                alert('Management server error with '+opts.url);
            }
        });
    }
});