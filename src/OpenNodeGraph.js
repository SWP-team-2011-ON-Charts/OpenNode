/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.OpenNodeGraph', {
    extend: 'Funcman.Graph',
    alias: 'OpenNodeGraph',
    
    dcid: 0, vmid: 0,
    
    attachInfoWindow: function(node) {
        var me = this;

        var iw = Ext.create('Ext.Panel', {
            title: node.name,
            layout: 'vbox',
            width: 65,
            height: 45,
            preventHeader: true,
        });

        if (node.type == "pm") {
            iw.add({xtype: 'button', text: 'Create VM', handler: function() {
				var newVmParams = Ext.create('Ext.Window', {
					title: 'New VM parameters',
					height: 300,
					width: 350,
					layout: {
						type: 'table',
						columns:3
						},
					defaults: {
						bodyStyle: 'padding:20px'
					},
					items: [{
						xtype: 'textfield',
						fieldLabel: 'VM hostname',
						labelAlign: 'left',
						labelWidth: 100,
						colspan:3
						}, {
						xtype: 'textfield',
						fieldLabel: 'VM ID',
						labelAlign: 'left',
						labelWidth: 100,
						colspan:3
						}, {
						xtype: 'textfield',
						fieldLabel: 'Memory MB',
						width: 150,
						labelAlign: 'left',
						labelWidth: 100,
						colspan:2
						}, {
						xtype: 'slider',
						width: 150,
						value: 50,
						increment: 1,
						minValue: 0,
						maxValue: 100,
						colspan:1
						}, {
						xtype: 'textfield',
						fieldLabel: 'No of CPUs',
						width: 150,
						labelAlign: 'left',
						labelWidth: 100,
						colspan:2
						}, {
						xtype: 'slider',
						width: 150,
						value: 50,
						increment: 1,
						minValue: 0,
						maxValue: 100,
						colspan:1
						}, {
						xtype: 'textfield',
						fieldLabel: 'CPU limit(%)',
						width: 150,
						labelAlign: 'left',
						labelWidth: 100,
						colspan:2
						}, {
						xtype: 'slider',
						width: 150,
						value: 50,
						increment: 1,
						minValue: 0,
						maxValue: 100,
						colspan:1
						}, {
						xtype: 'textfield',
						fieldLabel: 'Disk size (GB)',
						width: 150,
						labelAlign: 'left',
						labelWidth: 100,
						colspan:2
						}, {
						xtype: 'slider',
						width: 150,
						value: 50,
						increment: 1,
						minValue: 0,
						maxValue: 100,
						colspan:1
						}, {
						
						//ei toimi mingil X põhjusel
						xtype: 'radiogroup',
						fieldLabel: 'Net type',
						labelAlign: 'left',
						labelWidth: 100,
						colspan:3,
						columns: 2,
						items: [
							{ boxLabel: 'VENET', name: 'rb', inputValue: '1' },
							{ boxLabel: 'VETH', name: 'rb', inputValue: '2' }
						],
						colspan:3
						}, {
                            xtype: 'button',
                            text: 'Create', handler: function(b) {
                                var me = this;
                                vm = me.createVM(null, me.vmid, 'VM '+me.vmid, b.node);
                                me.addNode(vm);
                                me.vmid++;
                                b.up().destroy();
                            },
                            scope: me,
                            node: node
                        }
					]
				});
				newVmParams.show();
			
			}});
            iw.add({xtype: 'button', text: 'Remove', handler: function(b) {me.removeNode(b.node);}, scope: me, node: node});
        }
        
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
        this.attachInfoWindow(dc);

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
        pm.children.push(vm);

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

    createMachineFromServer: function(path, res_id, name, dc) {
        var pm = Ext.create('GraphNode', {
            path: path,
            id: dc.id + 'pm'+res_id,
            res_id: res_id,
            type: 'pm',
            name : name,
            image: 'images/network-server.png',
            parent: dc,
            children: []
        });
        this.attachInfoWindow(pm);

        dc.children.push(pm);
        return pm;
    },
    
    syncWithServer: function(server_name) {
        var me = this;
        me.view.setLoading(true);

        Ext.Ajax.request({
            cors: true,
            url: server_name + '/computes/',
            success: function(response, opts) {
                var dc = me.createDatacenter(server_name+'/networks/'+me.dcid+'/', me.dcid, 'datacenter'+me.dcid);
                me.dcid++;
                
                Ext.each(Ext.JSON.decode(response.responseText, true), function(m) {
                    Ext.iterate(m, function(id, name) {
                        var pm = me.createMachineFromServer(server_name+'/computes/'+id+'/', id, name, dc);
                    });
                });
                me.addNode(dc);
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