//Ext.require('EMS.model.LabData');

Ext.define('EMS.store.LabData', {
    extend: 'Ext.data.Store',

    requires: [
     'EMS.model.LabData',
     'EMS.model.Protocol',
     'EMS.model.Worker',
     'EMS.model.ExperimentType'
    ],
    storeId: 'LabData',
    model:  'EMS.model.LabData',
    autoLoad: false,
    singleton: true,
    proxy:{
           type: 'ajax',
           api: {
            read : '/cgi-bin/barski/records.json?tablename=LabData',
            update: '/cgi-bin/barski/recordsUp.json'
           },
           reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
           }
          }
});

