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


Ext.define('EMS.view.Project.ProjectList', {
               extend: 'Ext.Window',
               alias : 'widget.ProjectListWindow',
               width: 700,
               height: 450,
               minWidth: 600,
               minHeight: 250,
               title: 'List of projects',
               closable: true,
               maximizable: true,
               closeAction: 'hide',
               constrain: true,
               iconCls: 'default',

               layout: {
                   type: 'vbox',
                   align: 'stretch'

               },


               initComponent: function() {
                   var me=this;
                   me.prjStore=EMS.store.Project;

                   me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
                                                       store: me.prjStore,
                                                       displayInfo: true
                                                   });

                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: {
                                            pack: 'center'
                                        },
                                        items: [{
                                                minWidth: 90,
                                                text: 'Close',
                                                handler: function() { me.close(); }
                                            }]
                                    }];

                   me.cols=[{   header: "Prj ID",             sortable: true,  width: 60,    dataIndex: 'id'  },
                            { header: 'Project Name', dataIndex: 'name', flex:1, sortable: true}];

                   if(Rights.check(USER_ID,'ProjectList')) {
                       me.cols.push({   header: "Worker",                 sortable: true,  width: 80,    dataIndex: 'worker_id',
                                        renderer: function(value,meta,record) {
                                            var rec=EMS.store.Worker.findRecord('id',value,0,false,false,true);
                                            return rec?rec.data.worker:'';
                                        }
                                    });
                   }

                   me.cols=me.cols.concat([{   header: "Date",                   sortable: true,   width: 70,    dataIndex: 'dateadd',
                                               renderer: Ext.util.Format.dateRenderer('m/d/Y'), filter: true
                                           } , {
                                               xtype: 'actioncolumn',
                                               width:55,
                                               align: 'center',
                                               sortable: false,
                                               items: [
                                                   {
                                                       getClass: function(v, meta, rec) {
                                                           this.items[0].tooltip = 'Delete';
                                                           this.items[0].handler = function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                                                               Ext.Msg.show({
                                                                                title: 'Deleteing project '+record.data.name,
                                                                                msg: 'Are you sure, that you want delete all data that belongs to "'+record.data.name
                                                                                     +'".<br> This process are going to delete all created groups, plots and results.',
                                                                                icon: Ext.Msg.QUESTION,
                                                                                buttons: Ext.Msg.YESNO,
                                                                                fn: function(btn) {
                                                                                    if(btn !== "yes") return;
                                                                                    grid.getStore().removeAt(rowIndex);
                                                                                    grid.getStore().sync();
                                                                                    grid.getStore().load();
                                                                                }
                                                                            });
                                                           }
                                                           return 'folder-delete';
                                                       }
                                                   }]
                                           } ]);

                   me.items =  [
                               {
                                   xtype: 'fieldset',
                                   title: 'Project',
                                   height: 70,
                                   padding: 1,
                                   margin: '0 5 0 5',
                                   layout: {
                                       type: 'hbox'
                                   },
                                   items: [{
                                           xtype: 'textfield',
                                           id: 'project-name',
                                           fieldLabel: 'Project name',
                                           submitValue: false,
                                           margin: '0 5 0 5',
                                           labelAlign: 'top',
                                           flex: 1,
                                           labelWidth: 120,
                                           enableKeyEvents: true,
                                           listeners: {
                                               specialkey: function (field, event) {
                                                   if (event.getKey() === event.ENTER) {
                                                       var button=Ext.getCmp('project-add');
                                                       button.fireEvent('click',button);
                                                   }
                                               }
                                           }
                                       } , {
                                           xtype: 'button',
                                           margin: '18 5 0 5',
                                           width: 90,
                                           text: 'add',
                                           id: 'project-add',
                                           submitValue: false,
                                           iconCls: 'folder-add'
                                       }]
                               } , {
                                   xtype: 'grid',
                                   border: true,
                                   columnLines: true,
                                   store: me.prjStore,
                                   margin: '5 5 0 5',
                                   multiSelect: false,
                                   viewConfig: {
                                       enableTextSelection: false
                                   },
                                   columns: me.cols,
                                   flex: 1,
                                   bbar: [ me.m_PagingToolbar ]
                               }
                           ];
                   this.callParent(arguments);
               }

           });
