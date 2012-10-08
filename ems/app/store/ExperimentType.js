Ext.define( 'EMS.store.ExperimentType', {
    extend: 'Ext.data.Store',

    requires: ['EMS.model.ExperimentType'],
    storeId: 'ExperimentType',
    model:  'EMS.model.ExperimentType',
    autoLoad: false,
    singleton: true,

    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=ExperimentType',
            update: '/cgi-bin/barski/recordsUp.json'
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           }
          }
});

