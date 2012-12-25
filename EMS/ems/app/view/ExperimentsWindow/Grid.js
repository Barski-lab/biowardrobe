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

Ext.define( 'EMS.view.ExperimentsWindow.Grid', {
               extend: 'Ext.grid.Panel',
               alias : 'widget.ExperimentsWindowGrid',

               border: false,
               columnLines: true,
               frame: false,

               initComponent: function() {
                   var filters = {
                         ftype: 'filters',
                         // encode and local configuration options defined previously for easier reuse
                         encode: true, // json encode the filter query
                         local: false   // defaults to false (remote filtering)
                     };

                   Ext.apply(this, {
                                 store: EMS.store.LabData,

                                 //features: [filters],

                                 columns:
                                     [
                                     Ext.create('Ext.grid.RowNumberer'),

                                     {   header: "Belongs to",                  sortable: true,  width: 90,    dataIndex: 'worker_id',
                                         renderer: function(value,meta,record){
                                             var rec=EMS.store.Worker.findRecord('id',value);
                                             return rec?rec.data.lname+', '+rec.data.fname:'';}},
                                     /*          {   header: "Run Index",              sortable: false,  width: 60,    dataIndex: 'IndexRun',     format: 0,  xtype: "numbercolumn",
                 editor: { xtype: 'numberfield',allowBlank: false,  minValue: 1,  maxValue: 150000 } },*/
                                     {   header: "Genome",                 sortable: true,  width: 70,    dataIndex: 'genome_id',
                                         renderer: function(value,meta,record){
                                             var rec=EMS.store.Genome.findRecord('id',value);
                                             return rec?rec.data.Genome:'';}
                                     },
                                     {   header: "Cells",                  sortable: false,  width: 120,   dataIndex: 'Cells',        flex: 1},
                                     {   header: "Condition",                  sortable: false,  width: 120,   dataIndex: 'Conditions',        flex: 1},
                                     {   header: "Type",                   sortable: false,  width: 70,    dataIndex: 'experimenttype_id',
                                         renderer: function(value,meta,record){
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
                                     {   header: "Protocol",               sortable: false,  width: 70,    dataIndex: 'protocol_id',
                                         renderer: function(value,meta,record){
                                             var rec=EMS.store.Protocol.findRecord('id',value);
                                             return rec?rec.data.protocol:'';}
                                     },
                                     {   header: "Tags total",             sortable: false,  width: 70,    dataIndex: 'Tags_total' },
                                     {   header: "Tags mapped",            sortable: false,  width: 70,    dataIndex: 'Tags_mapped' },
                                     {   header: "Name for browser",       sortable: false,  width: 100,   dataIndex: 'Name4browser', flex: 1},
                                     {   header: "Lib. Code",              sortable: false,  width: 70,    dataIndex: 'LibCode'   },
                                     {   header: "Date",                   sortable: true,   width: 70,    dataIndex: 'date_add',    renderer: Ext.util.Format.dateRenderer('m/d/Y'), filter: true,
                                         /*                 , xtype: "datecolumn",
                 editor: { xtype: 'datefield',  allowBlank: false,
                 minValue: '01/01/2011', maxValue: Ext.Date.format(new Date(), 'm/d/Y'),
                 format: 'm/d/Y',minText: 'Cannot have a start date before the company existed!'}*/ }
                                 ]//columns


                             });  //grid/paging.js

                   this.callParent(arguments);
               }
           });//grid

