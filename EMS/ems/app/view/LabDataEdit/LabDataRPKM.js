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


Ext.define('EMS.view.LabDataEdit.LabDataRPKM', {
               extend: 'Ext.Panel',

               frame: true,
               border: false,
               plain: true,
               layout: 'fit',
               title: 'RPKM list',
               activeTab: 0,
               iconCls: 'table2',
               initComponent: function() {
                   var me=this;

                   me.columns=[
                               {   header: "RefsecId",  sortable: true, filterable: true,  width: 100,    dataIndex: 'refsec_id', hidden: false },
                               {   header: "GeneId",    sortable: true, filterable: true, width: 100,    dataIndex: 'gene_id' },
                               {   header: 'chrom',     sortable: true, filterable: true, width: 60,    dataIndex: 'chrom'  },
                               {   header: 'txStart',   sortable: true,  width: 80,    dataIndex: 'txStart', align: 'right' },
                               {   header: 'txEnd',     sortable: true,  width: 85,    dataIndex: 'txEnd', align: 'right'   },
                               {   header: 'strand',    sortable: true, filterable: true, width: 40,    dataIndex: 'strand', align: 'center'  },
                               {   header: 'RPKM',      sortable: true, filterable: true, width: 85,    dataIndex: 'RPKM_0', align: 'right' }
                           ];

                   var filters = {
                       ftype: 'filters',
                       encode: true,
                       local: false
                   };

                   me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
                                                       store: EMS.store.RPKM,
                                                       margin: "5 10 5 5",
                                                       displayInfo: true
                                                   });

                   me.items= [
                               {
                                   xtype: 'panel',
                                   layout: 'fit',
                                   region: 'center',
                                   frame: false,
                                   border: false,
                                   plain: true,
                                   items:[
                                       {
                                           viewConfig: {
                                               stripeRows: true,
                                               enableTextSelection: true
                                           },
                                           xtype: 'grid',
                                           hight: 60,
                                           frame: false,
                                           border: false,
                                           plain: true,
                                           columnLines: true,
                                           store: EMS.store.RPKM,
                                           remoteSort: true,
                                           features: [filters],
                                           columns: me.columns
                                       }
                                   ],
                                   tbar: [
                                       me.m_PagingToolbar,
                                       '-' ,
                                       {
                                           xtype: 'combobox',
                                           id: 'rpkm-group-filter',
                                           editable: false,
                                           queryMode: 'local',
                                           displayField: 'name',
                                           valueField: 'prefix',
                                           value: "",
                                           width: 110,
                                           store:Ext.create('Ext.data.Store', {
                                                                fields: ['prefix', 'name'],
                                                                data : [
                                                                    {"prefix":"", "name":"Isoforms"},
                                                                    {"prefix":"_genes", "name":"Genes"},
                                                                    {"prefix":"_common_tss", "name":"Common Tss"}
                                                                    //...
                                                                ]
                                                            }),
                                           margin: "5 5 5 10"
                                       } ,


                                       {
                                           xtype: 'fieldcontainer',
                                           layout: 'hbox',

                                           items: [
                                               {
                                                   xtype: 'button',
                                                   text: 'jump',
                                                   id: 'borwser-jump',
                                                   width: 80,
                                                   submitValue: false,
                                                   iconCls: 'genome-browser',
                                                   iconAlign:'left',
                                                   margin: '5 10 5 10'
                                               } , {
                                                   xtype: 'button',
                                                   store: EMS.store.RPKM,
                                                   text: 'save',
                                                   id: 'rpkm-save',
                                                   width: 80,
                                                   submitValue: false,
                                                   iconCls: 'disk',
                                                   margin: '5 10 5 10'
                                               }
                                           ]
                                       }



                                   ]//tbar
                               }
                           ];//me.items

                   me.callParent(arguments);
               }
           });


