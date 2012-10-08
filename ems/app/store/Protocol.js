Ext.define( 'EMS.store.Protocol', {
    extend: 'Ext.data.Store',

    requires: ['EMS.model.Protocol'],
    storeId: 'Protocol',
    model:  'EMS.model.Protocol',
    autoLoad: false,
    singleton: true,

    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=protocol',
            update: '/cgi-bin/barski/recordsUp.json'
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           }
          }
});

