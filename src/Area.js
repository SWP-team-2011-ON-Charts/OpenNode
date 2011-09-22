/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require(['Ext.button.*', 'Ext.chart.*']);
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit']);
Ext.require('Funcman.Graph');

Ext.onReady(function () {

    var graph;

    function addMachine() {
      //alert('VM');
      var machine = Ext.ModelMgr.create({
          image: 'images/computer.png',
          name: 'oms'
      }, 'Funcman.GraphNode');
      graph.addNode(machine);
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

    graph = Ext.create('Funcman.Graph', {
        renderTo: el
    });
});
