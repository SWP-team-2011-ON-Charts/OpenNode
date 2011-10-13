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
    

});
