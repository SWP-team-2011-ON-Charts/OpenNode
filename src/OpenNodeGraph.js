Ext.define('Funcman.OpenNodeGraph', {
    extend: 'Funcman.Graph',
    alias: 'OpenNodeGraph',
    
    dcid: 0, pmid: 0, vmid: 0, uid: 0,

    attachInfoWindow: function(node) {
        var me = this;
    
        var name = node.get('name');
        var nodetype = node.get('nodeType');

        if (nodetype == "dc") {
            addtext = "Register Machine";
            remtext = "Remove Datacenter";
            handler = me.addMachine;
        }
        else if (nodetype == "pm") {
            addtext = "Add VM";
            remtext = "Remove Machine";
            handler = me.addVM;
        }
        else if (nodetype == "vm") {
            addtext = "Add User";
            remtext = "Remove VM";
            handler = me.addUser;
        }
        else if (nodetype == "uu") {
            remtext = "Remove User";
            handler = me.addUser;
        }
        else {
            // Unknown node type
            return;
        }

        var iw = null;
        if (nodetype == "uu") {
            iw = Ext.create('Ext.Panel', {
                title: name,
                width: 100,
                height: 120,
                renderTo: me.viewcontainer.getEl(),
                layout: 'fit',
                floating: true,
                items: [{
                    xtype: 'label',
                    text: node.get('info')
                }, {
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    iconAlign: 'left',
                    node: node
                }]
            });
            
            iw.items.getAt(1).setHandler(me.remove, me);
            iw.show();
        }
        else {
            iw = Ext.create('Ext.Panel', {
                title: name,
                width: 100,
                height: 120,
                renderTo: me.viewcontainer.getEl(),
                layout: 'fit',
                floating: true,
                items: [{
                    xtype: 'label',
                    text: node.get('info')
                }, {
                    xtype: 'button',
                    text : addtext,
                    scale: 'medium',
                    iconCls: 'add',
                    node: node
                }, {
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    node: node
                }]
            });
            
            iw.items.getAt(1).setHandler(handler, me);
            iw.items.getAt(2).setHandler(me.remove, me);
            iw.show();
        }
        node.infowindow = iw;
    },

    addDatacenter: function() {
    	
        var dc = Ext.create('GraphNode', {
            id: 'dc'+this.dcid,
            nodeType: 'dc',
            name : 'datacenter ' + this.dcid,
            image: 'images/data-center.png',
            info: 'Data center status: running',
            left: 64 + this.dcid * 192,
        });
        this.attachInfoWindow(dc);
        
        this.addNode(dc);
        this.dcid++;
    },

    addMachine: function(button) {
        var node = button.node;
        var newid = node.get('id')+'pm'+this.pmid;
        
        var pm = Ext.create('GraphNode', {
            id: newid,
            nodeType: 'pm',
            name : 'Machine ' + this.pmid,
            image: 'images/network-server.png',
            info: 'Physical machine status: running',
            top: 64,
            left: this.pmid * 64,
        });
        this.attachInfoWindow(pm);

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();        
        this.addNode(pm);
        this.pmid++;
    },

    addVM: function(button) {
        var node = button.node;
        var newid = node.get('id')+'vm'+this.vmid;

        var vm = Ext.create('GraphNode', {
            id: newid,
            nodeType: 'vm',
            name : 'VM ' + this.vmid,
            image: 'images/computer.png',
            info: 'Physical machine status: running',
            top: 128,
            left: this.vmid * 64,
        });
        this.attachInfoWindow(vm);

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        this.addNode(vm);
        this.vmid++;
    },

    addUser: function(button) {
        var node = button.node;
        var newid = node.get('id')+'uu'+this.uid;

        var uu = Ext.create('GraphNode', {
            id: newid,
            nodeType: 'uu',
            name : 'User ' + this.uid,
            image: 'images/user.png',
            info: 'user',
            top: 192,
            left: this.uid * 64,
        });
        this.attachInfoWindow(uu);

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        this.addNode(uu);
        this.uid++;
    },

    remove: function(button, e) {
        this.removeNode(button.node);
    },

    addMachineFromServer: function(name) {
        var newid = 'pm'+this.pmid;

        var pm = Ext.create('GraphNode', {
            id: newid,
            nodeType: 'pm',
            name : name,
            image: 'images/network-server.png',
            info: 'Physical machine status: running',
            top: 64,
            left: this.pmid * 64,
        });
        this.attachInfoWindow(pm);

        this.addNode(pm);
        this.pmid++;
    },
    
    syncWithServer: function() {
        var me = this;

        Ext.Ajax.request({
            cors: true,
            url: 'http://anthrax11.homeip.net:8080/computes/',
            success: function(response, opts, x) {
              var o = Ext.JSON.decode(response.responseText, true);
              for(var i in o) {
                me.addMachineFromServer(o[i][i]);
              }
            },
            failure: function(response, opts) {
              alert('Could not connect to management server '+opts.url);
            }
        });
    }
});
