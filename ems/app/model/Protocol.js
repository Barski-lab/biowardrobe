Ext.define( 'EMS.model.Protocol', {
    extend: 'Ext.data.Model',

    fields: 
     [
      { name: 'id', type: 'int' },
      { name: 'protocol', type: 'string' }
     ],
     hasMany: { model: 'LabData', foreignKey: 'protocol' }
});
