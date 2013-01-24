/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the EMS web interface module of the genome-tools.
**
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Andrey Kartashov.
**
****************************************************************************/
Ext.require('EMS.model.Worker');

Ext.define( 'EMS.view.ExperimentsWindow.Grid', {
               extend: 'Ext.grid.Panel',
               alias : 'widget.ExperimentsWindowGrid',

               border: false,
               columnLines: true,
               frame: false,
               remoteSort: true,

               initComponent: function() {
                   var me = this;

                   var filters = {
                       ftype: 'filters',
                       // encode and local configuration options defined previously for easier reuse
                       encode: true, // json encode the filter query
                       local: false   // defaults to false (remote filtering)
                   };

                   Ext.apply(me, {
                                 store: EMS.store.LabData,

                                 features: [filters],
                                 viewConfig: {
                                     stripeRows: true,
                                     enableTextSelection: true
                                 },
                                 columns: [
                                     Ext.create('Ext.grid.RowNumberer'),

                                     {   header: "Belongs to",             sortable: true,  width: 85,    dataIndex: 'worker_id',
                                         renderer: function(value,meta,record) {
                                             var rec=EMS.store.Worker.findRecord('id',value);
                                             return rec?rec.data.fullname:'';
                                         }
                                     },
                                     {   header: "Genome",                 sortable: false,  width: 80,    dataIndex: 'genome_id',
                                         renderer: function(value,meta,record) {
                                             var rec=EMS.store.Genome.findRecord('id',value);
                                             return rec?rec.data.genome:'';
                                         }
                                     },
                                     {   header: "Type",                   sortable: false,  width: 90,    dataIndex: 'experimenttype_id',
                                         renderer: function(value,meta,record) {
                                             var rec=EMS.store.ExperimentType.findRecord('id',value);
                                             return rec?rec.data.etype:'';
                                         }
                                     },
                                     {   header: "Cells",                  sortable: false,  width: 230,   dataIndex: 'cells',
                                         filterable: true,
                                         filter: {
                                             type: 'string'
                                         }
                                     },
                                     {   header: "Condition",              sortable: false,  width: 380,   dataIndex: 'conditions',
                                         filterable: true,
                                         filter: {
                                             type: 'string'
                                         },
                                     },
                                     {   header: "Name for browser",       sortable: false,  width: 160,   dataIndex: 'name4browser'},
                                     {   header: "Lib. Code",              sortable: false,  width: 60,    dataIndex: 'libcode'},
                                     {   header: "Mapped",                 sortable: false,  width: 50,    dataIndex: 'tagspercent' },
                                     {
                                         header: "status",                 sortable: false,  width: 40,
                                         xtype: 'actioncolumn',
                                         menuDisabled: true,
                                         items: [
                                             {
                                                 getClass: function(v, meta, rec) {          // Or return a class from a function
                                                     var sts=rec.get('libstatus');
                                                     var base=(sts/1000)|0;
                                                     sts=sts%1000;
                                                     if(sts<10){
                                                         this.items[0].tooltip = rec.get('libstatustxt');
                                                         return 'data-'+base.toString()+'-'+sts.toString();
                                                     } else {
                                                         this.items[0].tooltip = 'complete';
                                                         return 'data-0-2';
                                                     }
                                                 },
                                                 handler: function(grid, rowIndex, colIndex) {
                                                     //var rec = store.getAt(rowIndex);
                                                 }
                                             } , {
                                                 getClass: function(v, meta, rec) {          // Or return a class from a function
                                                     var sts=rec.get('libstatus');
                                                     var base=(sts/1000)|0;
                                                     sts=sts%1000;
                                                     if(sts < 20 && sts >= 10 ){
                                                         this.items[1].tooltip = rec.get('libstatustxt');
                                                         return 'gear-'+base.toString()+'-'+sts.toString();
                                                     } else if (sts > 20){
                                                         this.items[1].tooltip = 'complete';
                                                         return 'gear-0-2';
                                                     }
                                                 }
                                             }
                                         ]

                                     },
                                     {   header: "Date",                   sortable: true,   width: 70,    dataIndex: 'dateadd',
                                         renderer: Ext.util.Format.dateRenderer('m/d/Y'), filter: true
                                     },
                                     {
                                         xtype: 'actioncolumn',            sortable: false,  width:55,
                                         menuDisabled: true,
                                         items: [
                                             {
                                                 getClass: function(v, meta, rec) {
                                                     this.items[0].tooltip='Duplicate record'
                                                     if(parseInt(rec.raw['worker_id']) === parseInt(USER_ID) || Rights.check(USER_ID,'ExperimentsWindow')) {
                                                         this.items[0].handler = function(grid, rowIndex, colIndex) {
                                                             var data=EMS.store.LabData.getAt(rowIndex).raw;

                                                             var r = Ext.create('EMS.model.LabData', {
                                                                                    worker_id: USER_ID,
                                                                                    genome_id:  data['genome_id'],
                                                                                    crosslink_id: data['crosslink_id'],
                                                                                    fragmentation_id: data['fragmentation_id'],
                                                                                    antibody_id: data['antibody_id'],
                                                                                    experimenttype_id: data['experimenttype_id'],
                                                                                    cells: data['cells'],
                                                                                    conditions: data['conditions'],
                                                                                    spikeinspool: data['spikeinspool'],
                                                                                    spikeins: data['spikeins'],
                                                                                    notes: data['notes'],
                                                                                    protocol: data['protocol'],
                                                                                    libstatus: 0,
                                                                                    libstatustxt: 'new',
                                                                                    dateadd: new Date()
                                                                                });
                                                              EMS.store.LabData.insert(rowIndex+1, r);
                                                         }
                                                         return 'table-row-add';
                                                     }
                                                 }
                                             } , {
                                                 getClass: function(v, meta, rec) {
                                                     this.items[1].tooltip=''
                                                     return 'space';
                                                 }
                                             } , {
                                                 getClass: function(v, meta, rec) {
                                                     this.items[2].tooltip='Delete record'
                                                     if(parseInt(rec.raw['worker_id']) === parseInt(USER_ID) || Rights.check(USER_ID,'ExperimentsWindow')) {
                                                         this.items[2].handler = function(grid, rowIndex, colIndex) {
                                                                 EMS.store.LabData.removeAt(rowIndex);
                                                         }
                                                         return 'table-row-delete';
                                                     }
                                                 }
                                             }
                                         ]
                                     }
                                 ],//columns

                                 tbar: [
                                     {
                                         text:'New',
                                         iconCls:'table-row-add',
                                         tooltip:'Describe a new experiment',
                                         id: 'new-experiment-data'
                                     } , {
                                         text:'Save',
                                         iconCls:'table2-check',
                                         tooltip:'Save changes',
                                         handler : function() {
                                             EMS.store.LabData.sync({
                                                             success: function (batch, options) {
                                                                 Ext.Msg.show({
                                                                                  title: 'Data saved',
                                                                                  msg: 'Records successfully stored',
                                                                                  icon: Ext.Msg.INFO,
                                                                                  buttons: Ext.Msg.OK
                                                                              });
                                                             }
                                             });
                                         }
                                     }, '-' ,
                                     Ext.create('Ext.PagingToolbar', {
                                                    store: EMS.store.LabData
                                                }),
                                     {
                                         xtype: 'combobox',
                                         id: 'labdata-grid-user-filter',
                                         displayField: 'fullname',
                                         editable: false,
                                         valueField: 'id',
                                         listeners: {
                                             render : function(){
                                                 var data=new Array();
                                                 data.push({id:0,fullname:'All'});
                                                 var name='All';
                                                 var num=0;
                                                 EMS.store.Worker.data.each(function (field) {
                                                     data.push({id:field.data['id'],fullname:field.data['fullname']});
                                                     if(parseInt(field.data['id'])===parseInt(USER_ID)) {
                                                         name=field.data['fullname'];
                                                         num=parseInt(field.data['id']);
                                                     }
                                                 });
                                                 this.store = Ext.create('Ext.data.Store', {
                                                     fields: ['id', 'fullname'],
                                                     data : data
                                                 });
                                                 this.setValue(num);
                                                 this.setRawValue(name);
                                             }
                                         }
                                     }
                                 ]//tbar

                             });  //grid/paging.js

                   this.callParent(arguments);
               }
           });//grid

