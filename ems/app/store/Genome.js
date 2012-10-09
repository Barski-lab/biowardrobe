Ext.define( 'EMS.store.Genome', {
    extend: 'Ext.data.Store',

    requires: ['EMS.model.Genome'],
    storeId: 'Genome',
    model:  'EMS.model.Genome',
    autoLoad: false,
    singleton: true,

    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=Genome',
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

