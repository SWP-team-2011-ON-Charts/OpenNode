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

        if (me.type == 'pm_settings') {
            me.setTitle(node.name + ': Physical Machine Settings');
            me.setSize(350, 450);
            
            me.add({
                xtype: 'button',
                text: 'Create VM',
                handler: function() {
                    node.settingsWindow = Ext.create('NodeSettingsWindow', {
                        type: 'vm_new',
                        node: node,
                        graph: me.graph
                    }).show();
                    me.destroy();
                }
            });

        } else if (me.type == 'vm_settings') {
            setTitle(node.name + ": Virtual Machine Settings");
            me.setSize(370, 470);
            me.add({
                xtype: 'button',
                text: 'Remove',
                handler: function() {
                    Ext.Msg.show({
                        title:'Removing VM',
                        msg: 'Are you sure you want to remove virtual machine "' + node.name + '"?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        fn: {
                            
                        }
                    });
                    me.destroy();
                }
            });

        } else if (me.type == 'vm_new') {
            me.setTitle('New VM');
            me.setSize(370, 470);
            
            me.add([{
                    xtype: 'textfield',
                    itemId: 'newVM_Name',
                    fieldLabel: 'VM hostname',
                    labelAlign: 'left',
                    labelWidth: 100,
                    value: 'VM '+me.graph.vmid,
                    colspan:3
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'VM ID',
                    labelAlign: 'left',
                    labelWidth: 100,
                    value: me.graph.vmid,
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
                        var me = this;
                        if(me.getComponent('newVM_psw1').value==me.getComponent('newVM_psw2').value) {
                            vm = me.graph.createVM(null, me.graph.vmid, me.getComponent('newVM_Name').value, b.node);
                            me.graph.addNode(vm);
                            me.graph.vmid++;
                            me.destroy();}
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
            }]);
        }
    },
    
    destroy: function() {
        delete this.node.settingsWindow;
        this.callParent(arguments);
    }
});