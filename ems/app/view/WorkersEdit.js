Ext.define('EMS.view.WorkersEdit', {
    extend: 'Ext.Window',
    alias : 'widget.WorkersEdit',
    width: 400,
    minWidth: 200,
    height: 300,
    title: 'Workers list',
    closable: true,
    maximizable: true,
    closeAction: 'hide',
    constrain: true,

    layout: 'fit',
    items: [{
        xtype: 'userlist'
    }]
});