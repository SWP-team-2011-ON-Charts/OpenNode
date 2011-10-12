/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.onReady(function () {

    var dcid = 0, pmid = 0, vmid = 0, uid = 0;

    function addDatacenter() {
        var dc = Ext.create('GraphNode', {
            id: 'dc'+dcid,
            name : 'datacenter ' + dcid,
            image: 'images/data-center.png',
            info: 'Data center status: running',
            left: 64 + dcid * 192,
        });
        
        graph.addNode(dc);
        dcid++;
    }

    function addMachine(button, e) {
        var node = button.node;
        var newid = 'pm'+pmid+node.get('id');

        var pm = Ext.create('GraphNode', {
            id: newid,
            name : 'Machine ' + pmid,
            image: 'images/network-server.png',
            info: 'Physical machine status: running',
            top: 64,
            left: pmid * 64,
        });

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        graph.addNode(pm);
        pmid++;
    }

    function addVM(button, e) {
        var node = button.node;
        var newid = 'vm'+vmid+node.get('id');

        var vm = Ext.create('GraphNode', {
            id: newid,
            name : 'VM ' + vmid,
            image: 'images/computer.png',
            info: 'Physical machine status: running',
            top: 128,
            left: vmid * 64,
        });

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        graph.addNode(vm);
        vmid++;
    }

    function addUser(button, e) {
        var node = button.node;
        var newid = 'u'+uid+node.get('id');

        var vm = Ext.create('GraphNode', {
            id: newid,
            name : 'User ' + uid,
            image: 'images/user.png',
            info: 'user',
            top: 192,
            left: uid * 64,
        });

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        graph.addNode(vm);
        uid++;
    }

    function remove(button, e) {
        var node = button.node;

        var children = node.children();
        children.removeAll();
        children.sync();
        
        graph.removeNode(node);
    }

    var body = Ext.getBody();

    Ext.widget('button', {
        text : 'Register datacenter',
        scale: 'medium',
        iconCls: 'add',
        iconAlign: 'left',
        renderTo: body,
        cls: 'floater',
        handler: addDatacenter
    });

    var graph = Ext.create('Graph', {
        renderTo: body,
        listeners: {
        selectionChange: function(dv, nodes) {
            if (nodes.length == 0)
                return;
        
            var node = nodes[0];
            if (this.infownd)
                this.infownd.destroy();

            var name = node.get('name');
            var id = node.get('id');

            var nodetype = id.substring(0,2);
            if (nodetype == "dc") {
                addtext = "Register Machine";
                remtext = "Remove Datacenter";
                handler = addMachine;
            }
            else if (nodetype == "pm") {
                addtext = "Add VM";
                remtext = "Remove Machine";
                handler = addVM;
            }
            else if (nodetype == "vm") {
                addtext = "Add User";
                remtext = "Remove VM";
                handler = addUser;
            }
            else {
                // Unknown node type
                return;
            }
            
            this.infownd = Ext.create('Ext.Window', {
                title: name,
                width: 80,
                height: 120,
                x: 100,
                y: 200,
                collapsible: true,
                //preventHeader: true,
                //renderTo: this.getEl(),
                //constrain: true,
                layout: 'fit',
                items: [{
                    xtype: 'label',
                    text: node.get('info')
                }, {
                    xtype: 'button',
                    text : addtext,
                    scale: 'medium',
                    iconCls: 'add',
                    iconAlign: 'left',
                    handler: handler,
                    node: node
                }, {
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    iconAlign: 'left',
                    handler: remove,
                    node: node
                }]
            });
            
            this.infownd.show();
        }
        }
    });
    graph.setHeight(300);
    graph.setWidth(300);
/*
    Ext.Ajax.request({
        //url: 'http://kodu.ut.ee/~anthrax/opennode/test.json',
        url: 'http://localhost:8080/computes',
        disableCaching: false,
        success: function(response) {
          var o = Ext.JSON.decode(response.responseText, true);
          alert('success');
        },
        failure: function(response) {
          alert('failure');
        }
    });
*/
/*
    var store = Ext.create('Ext.data.Store', {
        autoLoad: true,
        fields: ['id', 'name'],
        proxy: {
            type: 'ajax',
            url: 'http://localhost:8080/computes',
            reader: {
                type: 'json',
                root: ''
            }
        }
    });
    store.load(function(records, operation, success) {
        alert('blah');
    });
*/
});
