Ext.define( 'EMS.model.Genome', {
    extend: 'Ext.data.Model',

    fields: 
     [
      { name: 'id', type: 'int' },
      { name: 'Genome', type: 'string' }
     ],
    associations: [{
        model: 'LabData',
        type: 'hasMany',
        autoLoad: true
    }],

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
           }
          }
     
});