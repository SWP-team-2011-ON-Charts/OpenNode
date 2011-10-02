/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.require(['Ext.button.*']);
Ext.require(['Funcman.Graph', 'Funcman.GraphNode']);

Ext.onReady(function () {

    var mid = 0, uid = 0;
    var vm0 = null;

    function addMachine() {
        var vm = Ext.create('GraphNode', {
            id: 'm'+mid,
            name : 'Machine ' + mid,
            image: 'images/computer.png',
            info: 'Virtual machine status: running',
            top: 64,
            left: mid * 64,
        });

        if (vm0 === null) vm0 = vm;
        
        var children = oms.children();
        children.add({id: 'm'+mid});
        children.sync();
        
        graph.addNode(vm);
        mid++;
    }

    function addUser() {
        var user = Ext.create('GraphNode', {
            id: 'u'+uid,
            name : 'User',
            image: 'images/user.png',
            info: 'User',
            top: 128,
            left: uid * 64,
        });

        if (vm0) {
            var children = vm0.children();
            children.add({id: 'u'+uid});
            children.sync();
        }

        graph.addNode(user);
        uid++;
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
    // Add icons
    var oms = Ext.create('GraphNode', {
        id: '0',
        name : 'OMS',
        image: 'images/network-server.png',
        info: 'OMS Status: running',
        left: 64
    });

    addMachine();
    addUser();

    graph.addNode(oms);
});
