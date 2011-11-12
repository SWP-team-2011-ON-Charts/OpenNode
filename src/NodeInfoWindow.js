/*

Copyright (c) 2011 OpenNode Interactive Charts team

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/

Ext.define('Funcman.NodeInfoWindow', {
    alias: 'NodeInfoWindow',
    extend: 'Ext.draw.Component',

    cls: 'infowindow',
    layout: 'hbox',
    width: 65,
    height: 20,
    preventHeader: true,
    viewBox: false,

    cpuColor: '#94ae0a',
    memColor: '#115fa6',
    netColor: '#a61120',
    chartPadding: 2,

    initComponent: function() {
        var me = this,
            node = me.node;
        me.callParent();

        me.on('render', function(view) {
            var height = me.getHeight(),
                params = node.params;

            me.tip = Ext.create('Ext.tip.ToolTip', {
                target: me.el,
                html: 'CPU usage: ' + parseInt(params.cpu * 25.0) +
                    "%</br>Memory usage: " + parseInt(params.memory * 2.0) +
                    "%</br>Network usage: " + parseInt(params.network) + "%"
            });

            me.cpuBar = Ext.create('Ext.draw.Sprite', {
                type: 'rect',
                fill: me.cpuColor,
                x: 16,
                y: me.chartPadding,
                width: 8,
                height: height - me.chartPadding * 2,
                //stroke:"#4B4",
                surface: me.surface
            });
            me.cpuBar.redraw();

            me.memoryBar = Ext.create('Ext.draw.Sprite', {
                type: 'rect',
                fill: me.memColor,
                x: 26,
                y: me.chartPadding,
                width: 8,
                height: height - me.chartPadding * 2,
                //stroke:"#4B4",
                surface: me.surface
            });
            me.memoryBar.redraw();

            me.networkBar = Ext.create('Ext.draw.Sprite', {
                type: 'rect',
                fill: me.netColor,
                x: 36,
                y: me.chartPadding,
                width: 8,
                height: height - me.chartPadding * 2,
                //stroke:"#4B4",
                surface: me.surface
            });
            me.networkBar.redraw();

            me.runningImage = Ext.create('Ext.draw.Sprite', {
                type: 'image',
                src: 'images/running.png',
                width: 16,
                height: 16,
                x: 0,
                y: 2,
                surface: me.surface
            });
            me.runningImage.redraw();

            Ext.create('Ext.draw.Sprite', {
                type: 'image',
                src: 'images/settings.png',
                width: 16,
                height: 16,
                x: 48,
                y: 2,
                surface: me.surface
            }).redraw();

            Ext.create('Ext.draw.Sprite', {
                type: 'rect',
                fill: '#FFF',
                width: 65,
                height: height,
                stroke:"#CCC",
                surface: me.surface
            }).redraw();

            me.setInfo();
        }, me, {single: true});

        me.on('mouseup', function(e) {
            if (e.button == 2) {
                return;
            }
            if (node.settingsWindow) {
                node.settingsWindow.destroy();
                return;
            }

            node.settingsWindow = Ext.create('NodeSettingsWindow', {
                type: 'pm_settings',
                node: node,
                graph: me.up().up().up().up(),
            }).show();
            //e.stopEvent();
        }, me, {element: 'el'});
    },

    setInfo: function() {
        var me = this,
            params = me.node.params,
            height = me.getHeight() - me.chartPadding * 2,
            cpu = (params.cpu * 25.0 / 100) * height,
            mem = (params.memory * 2.0 / 100) * height,
            net = (params.network / 100) * height;

        me.cpuBar.setAttributes({y: height - cpu + me.chartPadding, height: cpu}, true);
        me.memoryBar.setAttributes({y: height - mem + me.chartPadding, height: mem}, true);
        me.networkBar.setAttributes({y: height - net + me.chartPadding, height: net}, true);

        me.runningImage.setAttributes({src: params.state == 'running' ? 'images/running.png' : 'images/stopped.png'}, true);
    },
});