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
					height: 450,
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
						itemId: 'newVM_Name',
						fieldLabel: 'VM hostname',
						labelAlign: 'left',
						labelWidth: 100,
						value: 'VM '+me.vmid,
						colspan:3
						}, {
						xtype: 'textfield',
						fieldLabel: 'VM ID',
						labelAlign: 'left',
						labelWidth: 100,
						value: me.vmid,
						colspan:3
						}, {
						xtype: 'numberfield',
						itemId: 'newVM_MB',
						fieldLabel: 'Memory MB',
						width: 170,
						labelAlign: 'left',
						labelWidth: 100,
						value: 50,
						minValue: 1,
						maxValue: 100,
						colspan:2,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_MB_slider').setValue(this.getValue());
								}
							}
						}, {
						xtype: 'slider',
						itemId: 'newVM_MB_slider',
						width: 150,
						value: 50,
						increment: 1,
						minValue: 1,
						maxValue: 100,
						colspan:1,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_MB').setValue(this.getValue());
								}
							}
						}, {
						xtype: 'numberfield',
						itemId: 'newVM_CPUs',
						fieldLabel: 'No of CPUs',
						width: 170,
						labelAlign: 'left',
						labelWidth: 100,
						value: 1,
						minValue: 1,
						maxValue: 8,
						colspan:2,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_CPUs_slider').setValue(this.getValue());
								}
							}
						}, {
						xtype: 'slider',
						itemId: 'newVM_CPUs_slider',
						width: 150,
						value: 1,
						increment: 1,
						minValue: 1,
						maxValue: 8,
						colspan:1,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_CPUs').setValue(this.getValue());
								}
							}
						}, {
						xtype: 'numberfield',
						itemId: 'newVM_CPU_Limit',
						fieldLabel: 'CPU limit(%)',
						width: 170,
						labelAlign: 'left',
						labelWidth: 100,
						value: 50,
						minValue: 1,
						maxValue: 100,
						colspan:2,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_CPU_Limit_slider').setValue(this.getValue());
								}
							}
						}, {
						xtype: 'slider',
						itemId: 'newVM_CPU_Limit_slider',
						width: 150,
						value: 50,
						increment: 1,
						minValue: 1,
						maxValue: 100,
						colspan:1,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_CPU_Limit').setValue(this.getValue());
								}
							}
						}, {
						xtype: 'numberfield',
						itemId: 'newVM_HDD',
						fieldLabel: 'Disk size (GB)',
						width: 170,
						labelAlign: 'left',
						labelWidth: 100,
						value: 50,
						minValue: 1,
						maxValue: 100,
						colspan:2,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_HDD_slider').setValue(this.getValue());
								}
							}
						}, {
						xtype: 'slider',
						itemId: 'newVM_HDD_slider',
						width: 150,
						value: 50,
						increment: 1,
						minValue: 1,
						maxValue: 100,
						colspan:1,
						listeners: {
							change: function(el, val) {
									newVmParams.getComponent('newVM_HDD').setValue(this.getValue());
								}
							}
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
						xtype: 'textfield',
						fieldLabel: 'IP address',
						labelAlign: 'left',
						labelWidth: 100,
						colspan:3
						}, {
						xtype: 'textfield',
						fieldLabel: 'DNS 1',
						labelAlign: 'left',
						labelWidth: 100,
						colspan:3
						}, {
						xtype: 'textfield',
						fieldLabel: 'DNS 2',
						labelAlign: 'left',
						labelWidth: 100,
						colspan:3
						}, {
						xtype: 'textfield',
						fieldLabel: 'DNS domain',
						labelAlign: 'left',
						labelWidth: 100,
						colspan:3
						}, {
						xtype: 'textfield',
						itemId: 'newVM_psw1',
						fieldLabel: 'Root password',
						labelAlign: 'left',
						labelWidth: 100,
						inputType:'password',
						colspan:3
						}, {
						xtype: 'textfield',
						itemId: 'newVM_psw2',
						fieldLabel: 'Confirm password',
						labelAlign: 'left',
						labelWidth: 100,
						inputType:'password',
						colspan:3
						}, {
						
						//ei toimi mingil X põhjusel
						xtype: 'fieldcontainer',
						fieldLabel: 'Start at boot',
						defaultType: 'checkboxfield',
						items: [
							{
								boxLabel  : '',
								name      : 'Start at boot',
								inputValue: '1',
								id        : 'startBoot'
							}],
						colspan:3
						}, {
                            xtype: 'button',
                            text: 'Create', handler: function(b) {
								if(newVmParams.getComponent('newVM_psw1').value==newVmParams.getComponent('newVM_psw2').value) {
									var me = this;
									vm = me.createVM(null, me.vmid, newVmParams.getComponent('newVM_Name').value, b.node);
									me.addNode(vm);
									me.vmid++;
									b.up().destroy();}
								else {alert('Passwords do not match. Please re-type both passwords.')}
                            },
                            scope: me,
                            node: node
                        }, {
                            xtype: 'button',
                            text: 'Cancel', handler: function(b) {
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
            me.createMachineFromServer(server+'/computes/'+m.id+'/', m.id, m.name, dc);
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