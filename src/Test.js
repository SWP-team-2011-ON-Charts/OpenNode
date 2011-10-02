/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/

Ext.require(['Ext.button.*']);
Ext.require(['Funcman.Graph', 'Funcman.GraphNode']);

Ext.onReady(function () {

    var left1 = 192;
    var left2 = 0;

    function addMachine() {
        var vm = Ext.create('GraphNode', {
            name : 'Machine',
            image: 'images/computer.png',
            top: 64,
            left: left1,
        });
        graph.addNode(vm);
        left1 += 64;
    }

    function addUser() {
        var user = Ext.create('GraphNode', {
            name : 'User',
            image: 'images/user.png',
            top: 128,
            left: left2,
        });
        graph.addNode(user);
        left2 += 64;
    }

    var body = Ext.getBody();

    Ext.widget('button', {
        text : 'Add VM',
        scale: 'large',
        iconCls: 'add',
        iconAlign: 'left',
        renderTo: body,
        cls: 'floater',
        handler: addMachine
    });

    Ext.widget('button', {
        text : 'Add User',
        scale: 'large',
        iconCls: 'add',
        iconAlign: 'left',
        renderTo: body,
        cls: 'floater',
        handler: addUser
    });

    var graph = Ext.create('Graph', {
        renderTo: body
    });
    graph.setHeight(250);
    graph.setWidth(250);
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
    // Add icons
    var vm1 = Ext.create('GraphNode', {
        id: '1',
        name : 'Machine',
        image: 'images/computer.png',
        top: 64,
        left: 0
    });
    var vm2 = Ext.create('GraphNode', {
        id: '2',
        name : 'Machine',
        image: 'images/computer.png',
        top: 64,
        left: 64
    });
    var vm3 = Ext.create('GraphNode', {
        id: '3',
        name : 'Machine',
        image: 'images/computer.png',
        top: 64,
        left: 128
    });
    var oms = Ext.create('GraphNode', {
        id: '0',
        name : 'OMS',
        image: 'images/network-server.png',
        left: 64
    });

    var children = oms.children();
    children.add({id: '1'});
    children.add({id: '2'});
    children.add({id: '3'});
    children.sync();

    graph.addNode(vm1);
    graph.addNode(vm2);
    graph.addNode(vm3);
    graph.addNode(oms);
});
