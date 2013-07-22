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
Ext.require([
                'Ext.grid.*',
                'Ext.data.*',
                'Ext.dd.*',
                'Ext.ux.form.SearchField'
            ]);

Ext.define('EMS.view.Project2.GenesLists', {
               extend: 'Ext.panel.Panel',
               title : 'Defining Genes Lists',
               id: 'Project2GenesLists',
               layout: 'border',
               region: 'center',
               iconCls: 'notebook3',
               border: false,


               initComponent: function() {
                   var me = this;

                   me.addEvents('Back');

                   me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
                                                       store: me.labDataStore,
                                                       displayInfo: true,
                                                       flex: 1,
                                                       margin: 0,
                                                       padding: 0
                                                   });

                   var rawData={
                       xtype: 'panel',
                       region: 'west',
                       title: 'RNA-Seq data',
                       collapsible: true,
                       collapsed: false,
                       border: false,
                       minWidth: 100,
                       split: true,
                       margin: 0,
                       layout: {
                           type: 'vbox',
                           align: 'stretch'
                       },
                       flex: 1,
                       items: [{
                               xtype: 'container',
                               padding: 0,
                               margin: 5,
                               layout: {
                                   type: 'hbox'
                                   //align: 'stretch'
                               },
                               items: [{
                                       xtype: 'combobox',
                                       id: 'project-worker-changed',
                                       displayField: 'fullname',
                                       editable: false,
                                       valueField: 'id',
                                       margin: '0 5 0 0',
                                       flex: 1,
                                       labelAlign: 'top',
                                       labelWidth: 120,
                                       store: EMS.store.Worker,
                                       value: USER_ID
                                   },{
                                       xtype: 'searchfield',
                                       submitValue: false,
                                       emptyText: 'Search string',
                                       flex: 1,
                                       store: me.labDataStore,
                                   }/* , {
                                       xtype: 'combobox',
                                       displayField: 'name',
                                       valueField: 'id',
                                       editable: false,
                                       id: 'preliminary-type-changed',
                                       fieldLabel: 'Type',
                                       labelAlign: 'top',
                                       labelWidth: 120,
                                       margin: '0 5 0 5',
                                       store: EMS.store.RType,
                                       flex: 4
                                   }*/]
                           } , {
                               xtype: 'grid',
                               border: false,
                               columnLines: true,
                               store: me.labDataStore,
                               multiSelect: true,
                               viewConfig: {
                                   plugins: {
                                       ptype: 'gridviewdragdrop',
                                       dragGroup: 'ldata2results',
                                   },
                                   copy: true,
                                   enableTextSelection: false
                               },
                               columns: [
                                   { header: '', dataIndex: 'combined',flex:1, sortable: false }
                               ],
                               flex: 3,
                               bbar: [ me.m_PagingToolbar ],
                           }
                       ]
                   };
                   ß
                   var geneList ={
                       xtype: 'panel',
                       title: 'Genes Lists',
                       frame: false,
                       border: false,
                       region: 'center',
                       split: true,
                       minWidth: 100,
                       //id
                       collapsible: false,
                       collapsed: false

                   };
                   me.items=[rawData, geneList];
                   me.tools = [{
                                   xtype: 'tbfill'
                               } , {
                                   xtype: 'button',
                                   text: 'Back',
                                   handler: function() {
                                       me.fireEvent('Back');
                                   }
                               }];

                   me.callParent(arguments);
               }
           });
