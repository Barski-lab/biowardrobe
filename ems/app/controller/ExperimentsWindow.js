
var count=0;

Ext.define('EMS.controller.ExperimentsWindow', {
    extend: 'Ext.app.Controller',

    models: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Protocol'],
    stores: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Protocol'],
    views:  ['EMS.view.ExperimentsWindow.Main','EMS.view.ExperimentsWindow.Grid','EMS.view.LabDataEdit.LabDataEdit'],

    init: function() 
    {
//        Logger.log('Experiments Control Loaded.');
        this.control({
         'ExperimentsWindow': {
             render: this.onPanelRendered
         },
         'ExperimentsWindow grid': {
//             selectionchange: this.onExperimentSelectionChanged,
             itemdblclick: this.onExperimentItemDblClick
         },
         'ExperimentsWindow button[action=Add]': {
             click: this.onAdd
         },
         'ExperimentsWindow button[action=Refresh]': {
             click: this.onRefresh
         },
         'LabDataEdit button[action=save]': {
             click: this.onSave
         }
        });
    },
//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
onPanelRendered: function() {
/*        workStore=this.getWorkerStore();
        workStore.load();

/*        typeStore=this.getExperimentTypesStore();
        typeStore.load();

        protocolStore=this.getProtocolStore();
        protocolStore.load();

        genomeStore=this.getGenomeStore();
        genomeStore.load();

        antiStore=this.getAntibodiesStore();
        antiStore.load();
*/
/*        workStore.on({
        'load': {
          fn: function(store,record,options){
          this.LabDataLoad();
         },
         scope:this
        }
        });
        typeStore.on({
        'load': {
          fn: function(store,record,options){
          this.LabDataLoad();
         },
         scope:this
        }
        });

        genomeStore.on({
        'load': {
          fn: function(store,record,options){
          this.LabDataLoad();
         },
         scope:this
        }
        });

        protocolStore.on({
        'load': {
          fn: function(store,record,options){
          this.LabDataLoad();
         },
         scope:this
        }
        });
*/
        console.log('The panel was rendered');
},

//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
LabDataLoad: function() {

 if(count<2) {count++; return;}
     labStore=this.getLabDataStore();
     labStore.load();
     console.log('LabStore loading '+count+' '+labStore.self.getName());
},
//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------

onAdd: function() {
    Logger.log('Add pressed');
    var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit').show();
},
//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
onRefresh: function() {
    Logger.log('Refresh pressed');

},
//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
onSave: function() {
    Logger.log('Save pressed');


},
/*
//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
onExperimentSelectionChanged: function() {
        console.log('onExperimentSelectionChanged');
},
*/
//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
onExperimentItemDblClick: function(grid,record) {
 
 Logger.log('onDblClicked grd:'+grid.self.getName()+' rec:'+record.self.getName());
 
 var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit').show();
// edit.show();
 form=edit.down('form');
// edit.setTitle(edit.getTitle()+" Hi");
 form.loadRecord(record);
 console.log('record:');
 console.log(record);
}

});
