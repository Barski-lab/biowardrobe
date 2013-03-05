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

Ext.define('EMS.view.Project.Preliminary', {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel'],
               title : 'Add Preliminary Results',
               id: 'ProjectPreliminary',
               layout: 'fit',
               iconCls: 'default',
               maximizable: true,
               collapsible: true,
               constrain: true,
               minHeight: 550,
               minWidth: 700,
               height: 550,
               width: 900,
               initComponent: function() {
                   var me = this;
                   var closebutt={
                       minWidth: 90,
                       text: 'Close',
                       handler: function() { me.close(); }
                   };
                   var savebutt={
                       minWidth: 90,
                       text: 'Save',
                       id: ''
                   };
                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: {
                                            pack: 'center'
                                        },
                                        items: []
                                    }];
                   me.dockedItems[0].items=[savebutt,closebutt];
                   var filters = {
                       ftype: 'filters',
                       encode: true,
                       local: false
                   };
                   me.labDataStore=EMS.store.LabData;
                   me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
                                                       store: me.labDataStore,
                                                       displayInfo: true
                                                   });

                   var store = Ext.create('Ext.data.TreeStore', {
                                              root: {
                                                  expanded: false,
                                                  children: [
                                                      { text: "detention", leaf: true },
                                                      { text: "homework", expanded: false, children: [
                                                              { text: "book report", leaf: true },
                                                              { text: "alegrbra", leaf: true}
                                                          ] },
                                                      { text: "buy lottery tickets", leaf: true }
                                                  ]
                                              }
                                          });

                   me.items=[ {
                                 xtype: 'container',
                                 layout: {
                                     type: 'hbox',
                                     align: 'stretch'
                                 },
                                 items: [
                                     {
                                         xtype: 'treepanel',
                                         title: 'Simple Tree',
                                         width: 200,
                                         height: 150,
                                         store: store,
                                         rootVisible: true,
                                         flex: 1,
                                         viewConfig: {
                                             plugins: {
                                                 ptype: 'treeviewdragdrop',
                                                 dragGroup: 'secondGridDDGroup',
                                                 dropGroup: 'firstGridDDGroup'
                                             },
                                             listeners: {
                                                 drop: function(node, data, dropRec, dropPosition) {
                                                     //                                                     var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('id') : ' on empty view';
                                                     //                                                     Ext.example.msg("Drag from right to left", 'Dropped ' + data.records[0].get('id') + dropOn);
                                                 }
                                             },
                                             copy: true,
                                             enableTextSelection: false
                                         }
                                     },
                                     {
                                         xtype: 'container',
                                         layout: {
                                             type: 'vbox',
                                             align: 'stretch'
                                         },
                                         flex: 1,
                                         items: [
                                             {
                                                 xtype: 'fieldset',
                                                 title: 'Filtering',
                                                 layout: {
                                                     type: 'hbox',
                                                     align: 'stretch'
                                                 },
                                                 hight: 80,

                                                 items: [{
                                                         xtype: 'combobox',
                                                         id: 'preliminary-worker-changed',
                                                         displayField: 'fullname',
                                                         editable: false,
                                                         valueField: 'id',
                                                         flex: 4,
                                                         fieldLabel: 'Worker',
                                                         labelAlign: 'top',
                                                         labelWidth: 120,
                                                         store: EMS.store.Worker,
                                                         value: USER_ID
                                                     } , {
                                                         xtype: 'combobox',
                                                         displayField: 'name',
                                                         valueField: 'id',
                                                         value: 1,
                                                         fieldLabel: 'Type',
                                                         labelAlign: 'top',
                                                         labelWidth: 120,
                                                         margin: '0 5 0 5',
                                                         store:Ext.create('Ext.data.Store', {
                                                                              fields: ['id', 'name'],
                                                                              data : [
                                                                                  {"id":1, "name":"RPKM isoforms"},
                                                                                  {"id":2, "name":"RPKM genes"},
                                                                                  {"id":3, "name":"RPKM common tss"},
                                                                                  {"id":4, "name":"CHIP islands"}
                                                                              ]
                                                                          }),
                                                         flex: 4
                                                     }]
                                             } , {
                                                 xtype: 'grid',
                                                 border: true,
                                                 columnLines: true,
                                                 store: me.labDataStore,
                                                 features: [filters],
                                                 multiSelect: true,
                                                 viewConfig: {
                                                     plugins: {
                                                         ptype: 'gridviewdragdrop',
                                                         dragGroup: 'firstGridDDGroup',
                                                         dropGroup: 'secondGridDDGroup'
                                                     },
                                                     listeners: {
                                                         drop: function(node, data, dropRec, dropPosition) {
                                                             //                                                             var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('id') : ' on empty view';
                                                             //                                                             Ext.example.msg("Drag from right to left", 'Dropped ' + data.records[0].get('id') + dropOn);
                                                         }
                                                     },
                                                     copy: true,
                                                     enableTextSelection: false
                                                 },
                                                 columns: [
                                                     { header: 'Experiment list', dataIndex: 'cells', flex:1, sortable: true,
                                                         renderer: function(value,meta,record) {

                                                             return Ext.String.format('<b>{0}</b><br><small> date: <i>{1}</i> id: <i>{2}</i></small><br>{3}<br>{4}',
                                                                                      record.data['cells'],
                                                                                      Ext.util.Format.date(record.data['dateadd'],'m/d/Y'),
                                                                                      record.data['id'], record.data['conditions'],record.data['name4browser']);
                                                         }
                                                     },
                                                 ],
                                                 flex: 3,
                                                 tbar: [
                                                     me.m_PagingToolbar
                                                 ]
                                             }
                                         ]
                                     }
                                 ]
                             }
                           ];


                   me.callParent(arguments);
               }
           });
