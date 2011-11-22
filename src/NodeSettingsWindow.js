/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.NodeSettingsWindow', {
    alias: 'NodeSettingsWindow',
    extend: 'Ext.Window',

    bodyStyle: 'padding:20px',
    layout: {
        type: 'table',
        columns:3
    },

    initComponent: function() {
        var me = this,
            node = me.node,
            type = node.type;

        me.callParent();

        if (me.type == 'settings') {
            if (type == 'pm') {
                me.setTitle(node.getName() + ': Physical Machine Settings');
                me.setSize(320, 250);
            } else {
                me.setTitle(node.getName() + ': Virtual Machine Settings');
                me.setSize(370, 300);
            }
            me.animateTarget = node;
            
            me.runButton = Ext.create('Ext.Button', {
                xtype: 'button',
                scale: 'medium'
            });
            me.runButton.setHandler(me.runButtonListener, me);

            me.suspendButton = Ext.create('Ext.Button', {
                xtype: 'button',
                scale: 'medium'
            });
            me.suspendButton.setHandler(me.suspendButtonListener, me);

            me.stateLabel = Ext.create('Ext.form.Label', {
                xtype: 'label',
                colspan: 2
            });

            var button;
            if (type == 'pm') {
                button = Ext.create('Ext.Button', {
                    xtype: 'button',
                    text: 'Create VM',
                    icon: '../resources/images/computer-22.png',
                    scale: 'medium',
                    margin: '0 10 0 0',
                    handler: function() {
                        node.settingsWindow = Ext.create('NodeSettingsWindow', {
                            type: 'vm_new',
                            node: node,
                            graph: me.graph
                        }).show();
                        me.destroy();
                    }
                });
            } else if (type == 'vm') {
                button = Ext.create('Ext.Button', {
                    xtype: 'button',
                    text: 'Delete VM',
                    icon: '../resources/images/delete.png',
                    scale: 'medium',
                    margin: '0 10 0 0',
                });
                button.setHandler(me.removeButtonListener, me);
            }

            me.add(
            button,
            me.runButton,
            me.suspendButton,
            {
                xtype: 'label',
                text: 'Status: ',
            },
            me.stateLabel,
            {
                xtype: 'label',
                text: 'Name:',
            }, {
                xtype: 'label',
                text: node.params.name,
                colspan: 2
            }, {
                xtype: 'label',
                text: 'ID:',
            }, {
                xtype: 'label',
                text: ''+node.params.id,
                colspan: 2
            });
            
            if (type == 'pm') {
                me.add(
                {
                    xtype: 'label',
                    text: 'Arch:',
                }, {
                    xtype: 'label',
                    text: node.params.arch,
                    colspan: 2
                }, {
                    xtype: 'label',
                    text: 'Cores:',
                }, {
                    xtype: 'label',
                    text: node.params.cores,
                    colspan: 2
                }, {
                    xtype: 'label',
                    text: 'Template:',
                }, {
                    xtype: 'label',
                    text: node.params.template,
                    colspan: 2
                });
            } else if (type == 'vm') {
                me.add({
                    xtype: 'numberfield',
                    itemId: 'VM_MB',
                    fieldLabel: 'Memory GB',
                    width: 170,
                    labelAlign: 'left',
                    labelWidth: 100,
                    value: node.params.memory,
                    minValue: 1,
                    maxValue: 64,
                    colspan:2,
                    listeners: {
                        change: function(el, val) {
                            me.getComponent('VM_MB_slider').setValue(this.getValue());
                        }
                    }
                }, {
                    xtype: 'slider',
                    itemId: 'VM_MB_slider',
                    width: 150,
                    value: node.params.memory,
                    increment: 1,
                    minValue: 1,
                    maxValue: 64,
                    colspan:1,
                    listeners: {
                        change: function(el, val) {
                            me.getComponent('VM_MB').setValue(this.getValue());
                        }
                    }
                }, {
                    xtype: 'textfield',
                    itemId: 'VM_IP',
                    fieldLabel: 'IP address',
                    labelAlign: 'left',
                    labelWidth: 100,
                    colspan:3,
                    value: node.params.ip
                }, {
                    xtype: 'textfield',
                    itemId: 'VM_DNS1',
                    fieldLabel: 'DNS 1',
                    labelAlign: 'left',
                    labelWidth: 100,
                    colspan:3,
                    value: node.params.dns1
                }, {
                    xtype: 'textfield',
                    itemId: 'VM_DNS2',
                    fieldLabel: 'DNS 2',
                    labelAlign: 'left',
                    labelWidth: 100,
                    colspan:3,
                    value: node.params.dns2
                });
            }

            me.add({
                xtype: 'button',
                text: 'OK',
                scale: 'medium',
                width: 60,
                margin: '10 0 0 0',
                colspan: 3,
                handler: function() {
                    if (node.type == 'vm') {
                        var ip = me.getComponent('VM_IP').value,
                            dns1 = me.getComponent('VM_DNS1').value,
                            dns2 = me.getComponent('VM_DNS2').value;

                        var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
                            ipArray = ip.match(ipPattern);
                        if (ipArray == null) {
                            alert('Invalid IP address');
                            me.getComponent('VM_ip').focus();
                            return;
                        }

                        node.params.ip = ip;
                        node.params.dns1 = dns1;
                        node.params.dns2 = dns2;
                        node.params.memory = me.getComponent('VM_MB').value;
                    }
                    me.close();
                }
            });
            me.setState(node.params.state);

        } else if (me.type == 'vm_new') {
            me.setTitle('New VM');
            me.setSize(370, 460);
            
            me.add([{
                    xtype: 'textfield',
                    itemId: 'newVM_Name',
                    fieldLabel: 'hostname',
                    labelAlign: 'left',
                    labelWidth: 100,
                    disabled: true,
                    colspan:3
                }, {
                    xtype: 'textfield',
                    itemId: 'newVM_ID',
                    fieldLabel: 'ID',
                    labelAlign: 'left',
                    labelWidth: 100,
                    value: '0',
                    disabled: true,
                    colspan:3
                }, {
                    xtype: 'numberfield',
                    itemId: 'newVM_MB',
                    fieldLabel: 'Memory GB',
                    width: 170,
                    labelAlign: 'left',
                    labelWidth: 100,
                    value: 2,
                    minValue: 1,
                    maxValue: 64,
                    colspan:2,
                    listeners: {
                        change: function(el, val) {
                            me.getComponent('newVM_MB_slider').setValue(this.getValue());
                        }
                    }
                }, {
                    xtype: 'slider',
                    itemId: 'newVM_MB_slider',
                    width: 150,
                    value: 2,
                    increment: 1,
                    minValue: 1,
                    maxValue: 64,
                    colspan:1,
                    listeners: {
                        change: function(el, val) {
                            me.getComponent('newVM_MB').setValue(this.getValue());
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
                            me.getComponent('newVM_CPUs_slider').setValue(this.getValue());
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
                            me.getComponent('newVM_CPUs').setValue(this.getValue());
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
                            me.getComponent('newVM_CPU_Limit_slider').setValue(this.getValue());
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
                            me.getComponent('newVM_CPU_Limit').setValue(this.getValue());
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
                            me.getComponent('newVM_HDD_slider').setValue(this.getValue());
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
                            me.getComponent('newVM_HDD').setValue(this.getValue());
                        }
                    }
                }, /*{
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
                    ]
                }, */{
                    xtype: 'textfield',
                    itemId: 'newVM_IP',
                    fieldLabel: 'IP address',
                    labelAlign: 'left',
                    labelWidth: 100,
                    colspan:3
                }, {
                    xtype: 'textfield',
                    itemId: 'newVM_DNS1',
                    fieldLabel: 'DNS 1',
                    labelAlign: 'left',
                    labelWidth: 100,
                    colspan:3
                }, {
                    xtype: 'textfield',
                    itemId: 'newVM_DNS2',
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
                    text: 'Create',
                    handler: function(b) {
                        var me = this,
                            password = me.getComponent('newVM_psw1').value,
                            name = me.getComponent('newVM_Name').value,
                            id = me.getComponent('newVM_ID').value,
                            ip = me.getComponent('newVM_IP').value,
                            dns1 = me.getComponent('newVM_DNS1').value,
                            dns2 = me.getComponent('newVM_DNS2').value;

                        if(name == '') {
                            alert('Please enter a name.');
                            me.getComponent('newVM_Name').focus();
                            return;
                        }
                        
                        if(id == '') {
                            alert('Please enter an ID number.');
                            me.getComponent('newVM_ID').focus();
                            return;
                        }

                        if(password != me.getComponent('newVM_psw2').value) {
                            alert('Passwords do not match. Please re-type both passwords.');
                            me.getComponent('newVM_psw1').focus();
                            return;
                        }

                        var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
                            ipArray = ip.match(ipPattern);
                        if (ipArray == null) {
                            alert('Invalid IP address');
                            me.getComponent('newVM_ip').focus();
                            return;
                        }
/*
                        for (i = 0; i < 4; i++) {
                            thisSegment = ipArray[i];
                            if (thisSegment > 255) {
                                alert('Invalid IP address');
                                return;
                            }
                            i = 4;
                        }
*/
                        var params = {
                            id: id,
                            ip: ip,
                            dns1: dns1,
                            dns2: dns2,
                            name: name,
                            state: 'stopped',
                            memory: me.getComponent('newVM_MB').value,
                            cpu: 0,
                            network: 0,
                            parent: node.params.id
                        };
                        vm = me.graph.createVM(node, params);
                        me.graph.addNode(vm);
                        me.graph.vmid++;
                        me.destroy();
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
            }]);

            me.graph.getUniqueID(node.getRoot(), me.setID, me)
        }
    },

    destroy: function() {
        delete this.node.settingsWindow;
        this.callParent(arguments);
    },

    setID: function(id) {
        var idField = this.getComponent('newVM_ID'),
            nameField = this.getComponent('newVM_Name'),
            addressField = this.getComponent('newVM_IP');
        idField.setValue(id);
        idField.enable();
        nameField.setValue('VM '+id);
        nameField.enable();
        addressField.setValue('192.168.0.'+id);
        addressField.enable();
    },

    startServerCommand: function() {
        this.runButton.disable();
        this.suspendButton.disable();
    },

    endServerCommand: function() {
        this.runButton.enable();
        if (this.node.params.state != 'stopped')
            this.suspendButton.enable();
    },

    runButtonListener: function(button, e) {
        var me = this,
            newState = (me.node.params.state == 'running' || me.node.params.state == 'suspended') ? 'stopped' : 'running';

        me.startServerCommand();

        // Temporary workaround
        if (me.node.type == 'vm') {
            me.setState(newState);
            me.node.setInfo();
            me.endServerCommand();
            return;
        }

        Ext.Ajax.request({
            cors: true,
            method: 'PUT',
            jsonData: {state: newState},
            url: me.node.path,
            headers: {
                'Authorization': me.node.getRoot().authString
            },
            success: function(response, opts) {
                me.setState(newState);
                me.node.setInfo();
                me.endServerCommand();
            },
            failure: function(response, opts) {
                alert('Management server error with '+opts.url);
                me.endServerCommand();
            }
        });
    },

    suspendButtonListener: function(button, e) {
        var me = this,
            newState = (me.node.params.state == 'running') ? 'suspended' : 'running';

        me.startServerCommand();

        // Temporary workaround
        if (me.node.type == 'vm') {
            me.setState(newState);
            me.node.setInfo();
            me.endServerCommand();
            return;
        }

        Ext.Ajax.request({
            cors: true,
            method: 'PUT',
            jsonData: {state: newState},
            url: me.node.path,
            headers: {
                'Authorization': me.node.getRoot().authString
            },
            success: function(response, opts) {
                me.setState(newState);
                me.node.setInfo();
                me.endServerCommand();
            },
            failure: function(response, opts) {
                alert('Management server error with '+opts.url);
                me.endServerCommand();
            }
        });
    },

    removeButtonListener: function() {
        var me = this,
            node = me.node;

        Ext.Msg.show({
            title:'Removing VM',
            msg: 'Are you sure you want to remove virtual machine "' + node.getName() + '"?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            fn: function(res) {
                if (res == 'yes') {
                    me.removeNode();
                }
            }
        });
    },

    removeNode: function() {
        var me = this,
            node = me.node,
            path = node.path;

        if (!path) {
            me.graph.removeNode(button.node);
            return;
        }

        Ext.Ajax.request({
            cors: true,
            method: 'DELETE',
            url: path,
            headers: {
                'Authorization': me.node.getRoot().authString
            },
            success: function() {
                me.graph.removeNode(node);
                me.destroy();
            },
            failure: function(response, opts) {
                if (response.status == 404) {
                    me.graph.removeNode(node);
                    me.destroy();
                } else {
                    alert('Could not connect to management server '+opts.url);
                }
            }
        });
    },

    setState: function(state) {
        var me = this;
        me.node.params.state = state;

        me.stateLabel.setText(state);

        if (state == 'running') {
            me.runButton.setText('Stop');
            me.runButton.setIcon('../resources/images/stop.png');
            me.suspendButton.setText('Suspend');
            me.suspendButton.setIcon('../resources/images/suspend.png');
        } else if (state == 'suspended') {
            me.runButton.setText('Stop');
            me.runButton.setIcon('../resources/images/stop.png');
            me.suspendButton.setText('Resume');
            me.suspendButton.setIcon('../resources/images/resume.png');
        } else if (state == 'stopped') {
            me.runButton.setText('Run');
            me.runButton.setIcon('../resources/images/stop.png');
            me.suspendButton.disable();
            me.suspendButton.setText('Suspend');
            me.suspendButton.setIcon('../resources/images/suspend.png');
        }
    }
});