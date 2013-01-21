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

                                     {   header: "Belongs to",             sortable: true,  width: 110,    dataIndex: 'worker_id',
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
                                     {   header: "Cells",                  sortable: false,  width: 280,   dataIndex: 'cells',
                                         filterable: true,
                                         filter: {
                                             type: 'string'
                                         }
                                     },
                                     {   header: "Condition",              sortable: false,  width: 400,   dataIndex: 'conditions',
                                         filterable: true,
                                         filter: {
                                             type: 'string'
                                         },
                                     },
                                     {   header: "Name for browser",       sortable: false,  width: 180,    dataIndex: 'name4browser'},
                                     {   header: "Tags total",             sortable: false,  width: 80,    dataIndex: 'tagstotal' },
                                     {   header: "Tags mapped",            sortable: false,  width: 80,    dataIndex: 'tagsmapped' },
                                     //{   header: "Lib. Code",              sortable: false,  width: 70,    dataIndex: 'libcode'   },
                                     {
                                         header: "status",
                                         width: 80,
                                         xtype: 'actioncolumn',
                                         sortable: false,
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
                                         xtype: 'actioncolumn',
                                         width:35,
                                         sortable: false,
                                         menuDisabled: true,
                                         items: [
                                             {
                                                 //tooltip: 'Delete record',
                                                 getClass: function(v, meta, rec) {
                                                     this.items[0].tooltip='Delete record'
                                                     if(parseInt(rec.raw['worker_id']) === parseInt(USER_ID) || USER_LNAME === 'porter') {
                                                         this.items[0].handler = function(grid, rowIndex, colIndex) {

                                                                 EMS.store.LabData.removeAt(rowIndex);
                                                         }
                                                         return 'table-row-delete';
                                                     }
                                                 },

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
                                                                 console.log('Sync successed' ,batch, options);
                                                                 //EMS.store.LabData.load();
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

