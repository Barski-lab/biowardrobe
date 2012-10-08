

Ext.define( 'EMS.view.ExperimentsWindow.Grid', {
         extend: 'Ext.grid.Panel',
         alias : 'widget.ExperimentsWindowGrid',

//         requires: [ 'EMS.store.LabData','EMS.store.Worker' ],
         border: false,
         columnLines: true,
         frame: false,


    initComponent: function() {
        EMS.store.Worker.load();
        EMS.store.Genome.load();
        Ext.apply(this, {

         //store: EMS.store.LabData,
        store: {
            autoLoad: true,
            model: 'EMS.model.LabData',
            listeners: {
                    load: function() {
                        console.log('LabData store loaded');
                    }
            }
        },

         columns:
         [
          Ext.create('Ext.grid.RowNumberer'),

          {   header: "Belongs to",                  sortable: false,  width: 80,    dataIndex: 'worker_id',
               renderer: function(value,meta,record){
                  var rec=EMS.store.Worker.findRecord('id',value);
                  return rec?rec.data.fname+', '+rec.data.lname:'';}},
/*          {   header: "Run Index",              sortable: false,  width: 60,    dataIndex: 'IndexRun',     format: 0,  xtype: "numbercolumn",
                 editor: { xtype: 'numberfield',allowBlank: false,  minValue: 1,  maxValue: 150000 } },*/
          {   header: "Genome",                 sortable: false,  width: 70,    dataIndex: 'genomeType',
               renderer: function(value,meta,record){
//               var rec=genStor.findRecord('id',value);
                  var rec=EMS.store.Genome.findRecord('id',value);
                  return rec?rec.data.Genome:'';}
          },
          {   header: "Cells",                  sortable: false,  width: 150,   dataIndex: 'Cells',        flex: 1},
          {   header: "Type",                   sortable: false,  width: 70,    dataIndex: 'Type', 
               renderer: function(value,meta,record){
//               var rec=reco.findRecord('id',value);
                  var rec=EMS.store.ExperimentType.findRecord('id',value);
                  return rec?rec.data.Type:'';}

/*          editor: {
              xtype: 'combobox',
              typeAhead: true,
              displayField: 'Type',
              triggerAction: 'all',
              selectOnTab: true,
              store: types_store,
//            lazyRender: true,
              listClass: 'x-combo-list-small'
          }*/},
          {   header: "Tags total",             sortable: false,  width: 70,    dataIndex: 'Tags_total' },
          {   header: "Tags mapped",            sortable: false,  width: 70,    dataIndex: 'Tags_mapped' },
          {   header: "Name for browser",       sortable: false,  width: 100,   dataIndex: 'Name4browser', flex: 1},
          {   header: "Lib. Code",              sortable: false,  width: 70,    dataIndex: 'LibCode'   },
          {   header: "Date",                   sortable: true,   width: 70,    dataIndex: 'date_add',    renderer: Ext.util.Format.dateRenderer('m/d/Y')
/*                 , xtype: "datecolumn",
                 editor: { xtype: 'datefield',  allowBlank: false,
                 minValue: '01/01/2011', maxValue: Ext.Date.format(new Date(), 'm/d/Y'),
                 format: 'm/d/Y',minText: 'Cannot have a start date before the company existed!'}*/ }
         ]//columns
        });
//        this.store.load(); 
//        this.getWorkersStore().load();
        this.callParent(arguments);
    }
});//grid

