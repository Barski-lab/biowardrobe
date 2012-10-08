Ext.define( 'EMS.store.Fragmentation', {
    extend: 'Ext.data.Store',

    requires: ['EMS.model.Fragmentation'],
    storeId: 'Fragmentation',
    model:  'EMS.model.Fragmentation',
    autoLoad: false,
    singleton: true,

    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=Fragmentation',
            update: '/cgi-bin/barski/recordsUp.json'
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           }
          }
});

