Ext.define( 'EMS.store.Crosslinking', {
    extend: 'Ext.data.Store',

    requires: ['EMS.model.Crosslinking'],
    storeId: 'Crosslinking',
    model:  'EMS.model.Crosslinking',
    autoLoad: false,
    singleton: true,

    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=Crosslink',
            update: '/cgi-bin/barski/recordsUp.json'
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           }
          }
});

