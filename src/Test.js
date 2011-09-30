/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/

Ext.Loader.setConfig({enabled: true});

Ext.require(['Ext.button.*', 'Ext.chart.*', 'Ext.ux.DataView.Draggable']);
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit']);
Ext.require(['Funcman.Graph', 'Funcman.GraphNode']);

Ext.onReady(function () {

    function addMachine() {
        var vm = Ext.create('GraphNode', {
            name : 'Machine',
            image: 'images/computer.png'
        });
        graph.addNode(vm);
    }

    function addUser() {
        var user = Ext.create('GraphNode', {
            name : 'User',
            image: 'images/user.png'
        });
        graph.addNode(user);
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

    var el = body.createChild({});

    var graph = Ext.create('Graph', {
        //id: 'name',
        renderTo: el
    });
    graph.setHeight(200);
    graph.setWidth(200);
    graph.addCls('showscrollbars');
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
    var vm = Ext.create('GraphNode', {
        name : 'Machine',
        image: 'images/computer.png',
        children: []
    });
    var oms = Ext.create('GraphNode', {
        name : 'OMS',
        image: 'images/network-server.png',
        children: [vm]
    });

    graph.addNode(oms);
});
