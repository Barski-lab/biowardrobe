Ext.define( 'EMS.store.Antibodies', {
    extend: 'Ext.data.Store',

    requires: ['EMS.model.Antibodies'],
    storeId: 'Antibodies',
    model:  'EMS.model.Antibodies',
    autoLoad: false,
    singleton: true,

    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=Antibodies',
            update: '/cgi-bin/barski/recordsUp.json'
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           }
          }
});

