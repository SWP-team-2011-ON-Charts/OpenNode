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
        var nodetype = node.get('nodeType');

        if (nodetype == "dc") {
            addtext = "Register Machine";
            remtext = "Remove Datacenter";
            handler = me.addMachine;
        }
        else if (nodetype == "pm") {
            addtext = "Add VM";
            remtext = "Remove Machine";
            handler = me.addVM;
        }
        else if (nodetype == "vm") {
            addtext = "Add User";
            remtext = "Remove VM";
            handler = me.addUser;
        }
        else if (nodetype == "uu") {
            remtext = "Remove User";
            handler = me.addUser;
        }
        else {
            // Unknown node type
            return;
        }

        var iw = null;
        if (nodetype == "uu") {
            iw = Ext.create('Ext.Panel', {
                title: name,
                width: 100,
                height: 110,
                renderTo: me.viewcontainer.getEl(),
                layout: 'fit',
                floating: true,
                items: [{
                    xtype: 'label',
                    text: node.get('info')
                }, {
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    iconAlign: 'left',
                    node: node
                }]
            });
            
            iw.items.getAt(1).setHandler(me.remove, me);
            iw.show();
        }
        else {
            var items = null;
            if (nodetype == "pm") {
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
                    xtype: 'textarea',
                    multiline: true
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
                }, {
                    xtype: 'label',
                    text: node.get('info')
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
            if (nodetype == "pm")
                iw.items.getAt(2).setHandler(me.getComputeInfo, me);

            iw.show();
        }
        node.infowindow = iw;
    },

    addDatacenter: function() {
    	
        var dc = Ext.create('GraphNode', {
            id: 'dc'+this.dcid,
            idnum: this.dcid,
            nodeType: 'dc',
            name : 'datacenter ' + this.dcid,
            image: 'images/data-center.png',
            info: 'Data center status: running',
            left: 64 + this.dcid * 192 * this.calc_left,
            calc_left: 1,
        });
        this.attachInfoWindow(dc);
        
        this.addNode(dc);
        this.dcid++;
        return dc;
    },

    addMachine: function(button) {
        var node = button.node;
        var newid = node.get('id')+'pm'+this.pmid;
        
        var pm = Ext.create('GraphNode', {
            id: newid,
            idnum: this.pmid,
            nodeType: 'pm',
            name : 'Machine ' + this.pmid,
            image: 'images/network-server.png',
            info: 'Physical machine status: running',
            top: 64,
            left: this.pmid * 64,
        });
        this.attachInfoWindow(pm);

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        this.addNode(pm);
        this.pmid++;
    },

    addVM: function(button) {
        var node = button.node;
        var newid = node.get('id')+'vm'+this.vmid;

        var vm = Ext.create('GraphNode', {
            id: newid,
            idnum: this.vmid,
            nodeType: 'vm',
            name : 'VM ' + this.vmid,
            image: 'images/computer.png',
            info: 'Physical machine status: running',
            top: 128,
            left: this.vmid * 64,
        });
        this.attachInfoWindow(vm);

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        this.addNode(vm);
        this.vmid++;
    },

    addUser: function(button) {
        var node = button.node;
        var newid = node.get('id')+'uu'+this.uid;

        var uu = Ext.create('GraphNode', {
            id: newid,
            idnum: this.uid,
            nodeType: 'uu',
            name : 'User ' + this.uid,
            image: 'images/user.png',
            info: 'user',
            top: 192,
            left: this.uid * 64,
        });
        this.attachInfoWindow(uu);

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        this.addNode(uu);
        this.uid++;
    },

    remove: function(button, e) {
        this.removeNode(button.node);
    },

    addMachineFromServer: function(name, dc) {
        var newid = 'pm'+this.pmid;

        var pm = Ext.create('GraphNode', {
            id: newid,
            idnum: this.pmid,
            nodeType: 'pm',
            name : name,
            image: 'images/network-server.png',
            info: 'Physical machine status: running',
            top: 64,
            left: this.pmid * 64,
        });
        this.attachInfoWindow(pm);

        var children = dc.children();
        children.add({childid: newid, id: newid});
        children.sync();

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
                var dc = me.addDatacenter();
            
                var o = Ext.JSON.decode(response.responseText, true);
                for(var i in o) {
                    me.addMachineFromServer(o[i][i], dc);
                }
                me.server_name = server_name;
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

        var infolabel = node.infowindow.items.getAt(3);

        Ext.Ajax.request({
            cors: true,
            url: me.server_name + '/computes/'+node.get('idnum')+'/',
            success: function(response, opts, x) {
                var o = Ext.JSON.decode(response.responseText, true);
                var text = '';
                for(var i in o) {
                    text += i+': '+o[i]+'\n';
                }
                infolabel.setValue(text);
            },
            failure: function(response, opts) {
                alert('Could not connect to management server '+opts.url);
            }
        });
    }
});
