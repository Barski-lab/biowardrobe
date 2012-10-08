Ext.define( 'EMS.model.Worker', {
    extend: 'Ext.data.Model',

    fields: 
     [
      { name: 'id', type: 'int' },
      { name: 'Worker', type: 'string' },
      { name: 'passwd', type: 'string' },
      { name: 'fname', type: 'string' },
      { name: 'lname', type: 'string' }
     ],
    hasMany: { model: 'LabData', foreignKey: 'worker_id' },
/*    associations: [{
        model: 'LabData',
        type: 'hasMany',
        autoLoad: true
    }],
*/
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
