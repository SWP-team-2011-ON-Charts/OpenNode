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

    var el = body.createChild({});
    //el.setHeight(100);
    //el.setWidth(100);

    var graph = Ext.create('Graph', {
        id: 'name',
        renderTo: el
    });
    graph.addCls('img-chooser-view');

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
