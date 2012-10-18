Ext.define( 'EMS.model.LabData', {
               extend: 'Ext.data.Model',
               requires : [
                   'EMS.model.ExperimentType',
                   'EMS.model.Genome',
                   'EMS.model.Worker',
                   'EMS.model.Protocol'
               ],

               fields: [
                   { name: 'id', type: 'int' },
                   'Cells',
                   'Mapping_cond',
                   'Conditions',
                   'spikeinspool',
                   'spikeins',
                   'Tags_total',
                   'Tags_mapped',
                   'LibCode',
                   'Name4browser',
                   'Notes',
                   'file_name',
                   { name: 'date_add', type: 'date' },
                   { name: 'libStatus', type: 'int' },
                   'libStatusTxt',
                   { name: 'genome_id', type: 'int' },
                   { name: 'crosslink_id', type: 'int' },
                   { name: 'fragmentation_id', type: 'int' },
                   { name: 'worker_id', type: 'int' },
                   { name: 'antibodies_id', type: 'int' },
                   { name: 'protocol_id', type: 'int' },
                   { name: 'experimenttype_id', type: 'int' }
               ],
               //    associations: [{
               //        model: 'Genome',
               //        type: 'hasMany',
               //        autoLoad: true
               //    }],
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
                   },
                   writer: {
                       type: 'json',
                       root: 'data',
                       writeAllFields: true
                   }
               }

           });

//#{"ID":"1","WORKER_ID":null,"LibCode":"ABAB4","Name4browser":"Naive CD4 Pol II","genomeType":"1",
//#"libStatus":null,"libStatusTxt":null,"IndexRun":"11","Type":"1","Cells":"Human Naive CD4 T cells (CD45R0-CD27+)",
//#"Tags_total":null,"Tags_mapped":null,"Mapping_cond":null,"Chip_cond":null,"Crosslink":"2","fragmentation":null,
//#"antibody":null,"protocol":null,"spikeinspool":null,"spikeins":null},
