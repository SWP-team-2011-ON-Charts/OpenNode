Ext.define('Funcman.OpenNodeGraph', {
    extend: 'Funcman.Graph',
    alias: 'OpenNodeGraph',
    
    dcid: 0, pmid: 0, vmid: 0, uid: 0,

    addDatacenter: function() {
        var dc = Ext.create('GraphNode', {
            id: 'dc'+this.dcid,
            name : 'datacenter ' + this.dcid,
            image: 'images/data-center.png',
            info: 'Data center status: running',
            left: 64 + this.dcid * 192,
        });
        
        this.addNode(dc);
        this.dcid++;
    },

    addMachine: function(button, e) {
        var node = button.node;
        var newid = 'pm'+this.pmid+node.get('id');

        var pm = Ext.create('GraphNode', {
            id: newid,
            name : 'Machine ' + this.pmid,
            image: 'images/network-server.png',
            info: 'Physical machine status: running',
            top: 64,
            left: this.pmid * 64,
        });

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        this.addNode(pm);
        this.pmid++;
    },

    addVM: function(button, e) {
        var node = button.node;
        var newid = 'vm'+this.vmid+node.get('id');

        var vm = Ext.create('GraphNode', {
            id: newid,
            name : 'VM ' + this.vmid,
            image: 'images/computer.png',
            info: 'Physical machine status: running',
            top: 128,
            left: this.vmid * 64,
        });

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        this.addNode(vm);
        this.vmid++;
    },

    addUser: function(button, e) {
        var node = button.node;
        var newid = 'u'+this.uid+node.get('id');

        var vm = Ext.create('GraphNode', {
            id: newid,
            name : 'User ' + this.uid,
            image: 'images/user.png',
            info: 'user',
            top: 192,
            left: this.uid * 64,
        });

        var children = node.children();
        children.add({childid: newid, id: newid});
        children.sync();
        
        this.addNode(vm);
        this.uid++;
    },

    remove: function(button, e) {
        if (this.infownd)
            this.infownd.destroy();
    
        this.removeNode(button.node);
    },
    
    listeners: {
        selectionChange: function(dv, nodes) {
            if (nodes.length == 0)
                return;
        
            var node = nodes[0];
            if (this.infownd)
                this.infownd.destroy();

            var name = node.get('name');
            var id = node.get('id');

            var nodetype = id.substring(0,2);
            if (nodetype == "dc") {
                addtext = "Register Machine";
                remtext = "Remove Datacenter";
                handler = this.addMachine;
            }
            else if (nodetype == "pm") {
                addtext = "Add VM";
                remtext = "Remove Machine";
                handler = this.addVM;
            }
            else if (nodetype == "vm") {
                addtext = "Add User";
                remtext = "Remove VM";
                handler = this.addUser;
            }
            else {
                // Unknown node type
                return;
            }
            
            this.infownd = Ext.create('Ext.Window', {
                title: name,
                width: 80,
                height: 120,
                x: 100,
                y: 200,
                collapsible: true,
                //preventHeader: true,
                //renderTo: this.getEl(),
                //constrain: true,
                layout: 'fit',
                items: [{
                    xtype: 'label',
                    text: node.get('info')
                }, {
                    xtype: 'button',
                    text : addtext,
                    scale: 'medium',
                    iconCls: 'add',
                    iconAlign: 'left',
                    node: node
                }, {
                    xtype: 'button',
                    text : remtext,
                    scale: 'medium',
                    iconCls: 'remove',
                    iconAlign: 'left',
                    node: node
                }]
            });
            
            this.infownd.items.getAt(1).setHandler(handler, this);
            this.infownd.items.getAt(2).setHandler(this.remove, this);
            
            this.infownd.show();
        }
    }
});
