Ext.define( 'EMS.store.Worker', {
    extend: 'Ext.data.Store',

    requires: ['EMS.model.Worker'],
    storeId: 'Worker',
    model:  'EMS.model.Worker',
    autoLoad: false,
    singleton: true,

    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=Worker',
            update: '/cgi-bin/barski/recordsUp.json'
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           },
           writer: {
            type: 'json',
            root: 'data',
            writeAllFields: true
            }
          }
});

