Ext.define( 'EMS.model.ExperimentType', {
    extend: 'Ext.data.Model',

    fields: 
     [
      { name: 'id', type: 'int' },
      { name: 'Type', type: 'string' },
      { name: 'Program', type: 'string' }
     ]
});
