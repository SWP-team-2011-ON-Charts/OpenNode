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
            var height = me.getHeight();
        
            me.tip = Ext.create('Ext.tip.ToolTip', {
                target: me.el,
                html: 'CPU usage: ' + parseInt(node.cpu * 25.0) +
                    "%</br>Memory usage: " + parseInt(node.memory * 2.0) +
                    "%</br>Network usage: " + parseInt(20) + "%"
            });

            me.cpuBar = Ext.create('Ext.draw.Sprite', {
                type: 'rect',
                fill: me.cpuColor,
                x: 2,
                y: me.chartPadding,
                width: 13,
                height: height - me.chartPadding * 2,
                //stroke:"#4B4",
                surface: me.surface
            });
            me.cpuBar.redraw();
            
            me.memoryBar = Ext.create('Ext.draw.Sprite', {
                type: 'rect',
                fill: me.memColor,
                x: 18,
                y: me.chartPadding,
                width: 13,
                height: height - me.chartPadding * 2,
                //stroke:"#4B4",
                surface: me.surface
            });
            me.memoryBar.redraw();
            
            me.networkBar = Ext.create('Ext.draw.Sprite', {
                type: 'rect',
                fill: me.netColor,
                x: 34,
                y: me.chartPadding,
                width: 13,
                height: height - me.chartPadding * 2,
                //stroke:"#4B4",
                surface: me.surface
            });
            me.networkBar.redraw();
            
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
            
            me.setUsage();
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
    
    setUsage: function() {
        var me = this,
            height = me.getHeight() - me.chartPadding * 2,
            cpu = (me.node.cpu * 25.0 / 100) * height,
            mem = (me.node.memory * 2.0 / 100) * height,
            net = (20 / 100) * height;

        me.cpuBar.setAttributes({y: height - cpu + me.chartPadding, height: cpu}, true);
        me.memoryBar.setAttributes({y: height - mem + me.chartPadding, height: mem}, true);
        me.networkBar.setAttributes({y: height - net + me.chartPadding, height: net}, true);
    }
});