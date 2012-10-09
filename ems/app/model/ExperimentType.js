Ext.define( 'EMS.model.ExperimentType', {
    extend: 'Ext.data.Model',

    fields: 
     [
      { name: 'id', type: 'int' },
      { name: 'Type', type: 'string' },
      { name: 'Program', type: 'string' }
     ],
//    associations: [{
//        model: 'LabData',
//        type: 'hasMany',
//        autoLoad: true
//    }],
    hasMany: { model: 'LabData', foreignKey: 'experimenttype_id' },

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
