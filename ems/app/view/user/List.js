Ext.define('EMS.view.user.List' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.userlist',

//    title : 'All Users',
    store: 'Worker',

    columns: [
        Ext.create('Ext.grid.RowNumberer'),
        {header: 'Worker',  dataIndex: 'Worker',  flex: 1},
        {header: 'First name', dataIndex: 'fname', flex: 1},
        {header: 'Last name', dataIndex: 'lname', flex: 1}
    ]
});
