Ext.define('Ext.selection.GraphViewModel', {
    extend: 'Ext.util.Observable',

    requires: ['Ext.util.KeyNav'],

    deselectOnContainerClick: true,

    /**
     * @cfg {Boolean} enableKeyNav
     *
     * Turns on/off keyboard navigation within the DataView.
     */
    enableKeyNav: true,

    bindComponent: function(view) {
        var me = this;
        me.view = view;

        if (me.enableKeyNav) {
            me.initKeyNav(view);
        }
    },

    initKeyNav: function(view) {
        var me = this;

        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }

        view.up().el.set({
            tabIndex: -1
        });
        me.keyNav = Ext.create('Ext.util.KeyNav', view.itemcontainer.el, {
            down: me.onNavKey,
            up: me.onNavKey,
            left: me.onNavKey,
            right: me.onNavKey,
            del: me.deleteHandler,
            scope: me
        });
    },

    deleteHandler: function() {
        alert('del');
    },

    onNavKey: function(step) {
        alert('nav');
    },

    // Allow the DataView to update the ui
    onSelectChange: function(record, isSelected, suppressEvent, commitFn) {
        var me = this,
            view = me.view,
            eventName = isSelected ? 'select' : 'deselect';

        if ((suppressEvent || me.fireEvent('before' + eventName, me, record)) !== false &&
                commitFn() !== false) {

            if (isSelected) {
                view.onItemSelect(record);
            } else {
                view.onItemDeselect(record);
            }

            if (!suppressEvent) {
                me.fireEvent(eventName, me, record);
            }
        }
    },
    
    destroy: function(){
        Ext.destroy(this.keyNav);
        this.callParent();
    }
});

