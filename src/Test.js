/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.onReady(function () {

    var body = Ext.getBody();

    var button = Ext.widget('button', {
        text : 'Register datacenter',
        scale: 'medium',
        iconCls: 'add',
        iconAlign: 'left',
        renderTo: body,
        cls: 'floater',
    });

    var graph = Ext.create('OpenNodeGraph', {
        renderTo: body,
    });

    graph.setHeight(600);
    graph.setWidth(900);

    button.setHandler(graph.addDatacenter, graph);
    
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
