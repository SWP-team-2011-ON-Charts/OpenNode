/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.OpenNodeGraph', {
    extend: 'Funcman.Graph',
    alias: 'OpenNodeGraph',
    
    dcid: 0, pmid: 0, vmid: 0, uid: 0,

    attachInfoWindow: function(node) {
        var me = this;
    
        var name = node.get('name');
        var type = node.get('type');

        if (type == "dc") {
            addtext = "Register Machine";
            remtext = "Remove Datacenter";
            handler = me.addMachine;
        }
        else if (type == "pm") {
            addtext = "Add VM";
            remtext = "Remove Machine";
            handler = me.addVM;
        }
        else if (type == "vm") {
            addtext = "Add User";
            remtext = "Remove VM";
            handler = me.addUser;
        }
        else if (type == "uu") {
            remtext = "Remove User";
            handler = me.addUser;
        }
        else {
            // Unknown node type
            return;
        }

        var iw = null;
        if (type == "uu") {
            iw = Ext.create('Ext.Panel', {
                title: name,
                width: 100,
                height: 110,
                renderTo: me.viewcontainer.getEl(),
                layout: 'fit',
                floating: true,
                items: [{
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    iconAlign: 'left',
                    node: node
                }]
            });
            
            iw.items.getAt(0).setHandler(me.remove, me);
            iw.show();
        }
        else {
            var items = null;
            if (type == "pm") {
                items = [{
                    xtype: 'button',
                    text : addtext,
                    scale: 'medium',
                    iconCls: 'add',
                    node: node
                }, {
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    node: node
                }, {
                    xtype: 'button',
                    text : 'Get Info',
                    scale: 'medium',
                    iconCls: 'refresh',
                    node: node
                }, {
                    xtype: 'container',
                    layout: { type: 'vbox' },
                    height: 150
                }];
            } else {
                items = [{
                    xtype: 'button',
                    text : addtext,
                    scale: 'medium',
                    iconCls: 'add',
                    node: node
                }, {
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    node: node
                }];
            }
            iw = Ext.create('Ext.Panel', {
                title: name,
                layout: 'vbox',
                //width: 100,
                height: 180,
                renderTo: me.viewcontainer.getEl(),
                floating: true,
                items: items
            });
            
            iw.items.getAt(0).setHandler(handler, me);
            iw.items.getAt(1).setHandler(me.remove, me);
            if (type == "pm")
                iw.items.getAt(2).setHandler(me.getComputeInfo, me);

            iw.show();
        }
        node.infowindow = iw;
    },

    addDatacenter: function(path, res_id, name) {
    	
        var dc = Ext.create('GraphNode', {
            id: 'dc'+res_id,
            res_id: res_id,
            path: path,
            type: 'dc',
            name : name,
            image: 'images/data-center.png',
            left: 64 + res_id * 192 * this.calc_left,
            calc_left: 1
        });
        this.attachInfoWindow(dc);
        dc.children = [];
        
        this.addNode(dc);
        return dc;
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

        node.children.push(pm);

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

        node.children.push(vm);
        
        this.addNode(vm);
        //this.setSelectedNode(vm);
        this.vmid++;
    },

    addUser: function(button) {
        var node = button.node;
        var newid = node.get('id')+'uu'+this.uid;

        var uu = Ext.create('GraphNode', {
            id: newid,
            idnum: this.uid,
            type: 'uu',
            name : 'User ' + this.uid,
            image: 'images/user.png',
            top: 192,
            left: this.uid * 64,
            children: [],
            parent: node
        });
        this.attachInfoWindow(uu);

        node.children.push(uu);
        
        this.addNode(uu);
        this.uid++;
    },

    remove: function(button, e) {
        var me = this;
        var node = button.node;

        Ext.Ajax.request({
            cors: true,
            method: 'DELETE',
            url: node.get('path'),
            success: function(response, opts, x) {
                var o = Ext.JSON.decode(response.responseText, true);
                me.removeNode(button.node);
            },
            failure: function(response, opts) {
                alert('Could not connect to management server '+opts.url);
            }
        });
    },

    addMachineFromServer: function(path, res_id, name, dc) {
        var newid = dc.get('id')+'pm'+res_id;

        var pm = Ext.create('GraphNode', {
            path: path,
            id: newid,
            res_id: res_id,
            type: 'pm',
            name : name,
            image: 'images/network-server.png',
            top: 64,
            left: this.pmid * 64,
            parent: dc
        });
        this.attachInfoWindow(pm);
        pm.children = [];

        dc.children.push(pm);

        this.addNode(pm);
        this.pmid++;
    },
    
    syncWithServer: function(server_name) {
        var me = this;
        me.view.setLoading(true);

        Ext.Ajax.request({
            cors: true,
            url: server_name + '/computes/',
            success: function(response, opts, x) {
                var dc = me.addDatacenter(server_name+'/networks/'+me.dcid+'/', me.dcid, 'datacenter'+me.dcid);
                me.dcid++;
            
                Ext.each(Ext.JSON.decode(response.responseText, true), function(m) {
                    Ext.iterate(m, function(id, name) {
                        me.addMachineFromServer(server_name+'/computes/'+id+'/', id, name, dc);
                    });
                });
                me.view.setLoading(false);
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
            success: function(response, opts, x) {
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
            success: function(response, opts, x) {
                button.setText(newStatus);
            },
            failure: function(response, opts) {
                alert('Management server error with '+opts.url);
            }
        });
    }
});