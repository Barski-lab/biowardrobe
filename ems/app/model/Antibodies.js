Ext.define( 'EMS.model.Antibodies', {
    extend: 'Ext.data.Model',

    fields: 
     [
      { name: 'id', type: 'int' },
      { name: 'Antibody', type: 'string' }
     ],
    associations: [{
        model: 'LabData',
        type: 'hasMany',
        autoLoad: true
    }]
     
//     hasMany: { model: 'LabData', foreignKey: 'antibodies_id'}
});
