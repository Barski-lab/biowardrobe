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


Ext.define('EMS.view.LabDataEdit.LabDataIslands', {
               extend: 'Ext.Panel',

               frame: true,
               border: false,
               plain: true,
               layout: 'fit',
               title: 'Islands list',
               iconCls: 'table2',
               initComponent: function() {
                   var me=this;

                   me.columns=[
                               {   header: 'chrom',     sortable: true, filterable: true, width: 60,    dataIndex: 'chrom'  },
                               {   header: 'start',   sortable: true,  width: 80,    dataIndex: 'start', align: 'right' },
                               {   header: 'end',     sortable: true,  width: 85,    dataIndex: 'end', align: 'right'   },
                               {   header: 'length',     sortable: true,  width: 85,    dataIndex: 'length', align: 'right'   },
                               {   header: 'pileup',      sortable: true, filterable: true, width: 85,    dataIndex: 'pileup', align: 'right', hidden: false },
                               {   header: 'abssummit',      sortable: true, filterable: true, width: 85,    dataIndex: 'abssummit', align: 'right' },
                               {   header: 'log10p',      sortable: true, filterable: true, width: 85,    dataIndex: 'log10p', align: 'right' },
                               {   header: 'foldenrich',      sortable: true, filterable: true, width: 85,    dataIndex: 'foldenrich', align: 'right' },
                               {   header: 'log10q',      sortable: true, filterable: true, width: 85,    dataIndex: 'log10q', align: 'right' }
                           ];

                   var filters = {
                       ftype: 'filters',
                       encode: true,
                       local: false
                   };

                   me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
                                                       store: EMS.store.Islands,
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
                                           store: EMS.store.Islands,
                                           remoteSort: true,
                                           features: [filters],
                                           columns: me.columns
                                       }
                                   ],

                                   tbar: [
                                       me.m_PagingToolbar,
                                       '-' ,
                                       {
                                           xtype: 'fieldcontainer',
                                           layout: 'hbox',

                                           items: [
                                               {
                                                   xtype: 'button',
                                                   text: 'jump',
                                                   id: 'browser-jump-islands',
                                                   width: 80,
                                                   submitValue: false,
                                                   iconCls: 'genome-browser',
                                                   iconAlign:'left',
                                                   margin: '5 10 5 10'
                                               } , {
                                                   xtype: 'button',
                                                   store: EMS.store.Islands,
                                                   text: 'save',
                                                   href:'',
                                                   id: 'islands-save',
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


