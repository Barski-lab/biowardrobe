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

Ext.define('EMS.controller.Project', {
               extend: 'Ext.app.Controller',
               models: ['LabData','Worker','RPKM','ResultsGroupping','RType','Project'],
               stores: ['LabData','Worker','RPKM','ResultsGroupping','RType','Project'],
               views:  ['Project.Preliminary','Project.ProjectList'],

               init: function() {
                   var me=this;
                   me.control({
                                  '#ProjectPreliminary': {
                                      //render: me.onPanelRendered,
                                      show: me.onPreliminaryWindowRendered,
                                      close: me.onPreliminaryWindowClose
                                  },
                                  '#preliminary-worker-changed': {
                                      select: me.onComboboxWorkerFilter
                                  },
                                  '#preliminary-type-changed': {
                                      select: me.onComboboxTypeFilter
                                  },
                                  '#preliminary-group-add': {
                                      click: me. onGroupAddClick
                                  },
                                  '#preliminary-save': {
                                      click: me.onSaveClick
                                  },
                                  /*
                                    Project Window
                                    */
                                  'ProjectListWindow': {
                                      render: me.onProjectWindowRendered
                                      //show: me.onProjectWindowRendered,
                                      //close: me.onProjectWindowClose
                                  },
                                  '#project-add': {
                                      click: me.onProjectAddClick
                                  },
                                  'ProjectListWindow grid': {
                                      //selectionchange: this.onSelectionChanged,
                                      itemdblclick: this.ProjectListWindowGridDblClick
                                  },

                              });
               },
               syncCombosAndGrid:function() {
                   this.getRTypeStore().load();
                   this.getLabDataStore().getProxy().setExtraParam('workerid',Ext.getCmp('preliminary-worker-changed').getValue());
                   this.getLabDataStore().getProxy().setExtraParam('typeid',Ext.getCmp('preliminary-type-changed').getValue());
                   Ext.getCmp('ProjectPreliminary').m_PagingToolbar.moveFirst()
               },
               onComboboxWorkerFilter: function(combo, records, options) {
                   this.syncCombosAndGrid();
               },
               onComboboxTypeFilter: function(combo, records, options) {
                   this.syncCombosAndGrid();
               },
               onPreliminaryWindowRendered: function(view) {
                   this.syncCombosAndGrid();
               },
               onPreliminaryWindowClose: function(view) {
                   delete this.getLabDataStore().getProxy().extraParams['typeid'];
                   Ext.getCmp('ProjectPreliminary').m_PagingToolbar.moveFirst()
               },
               onGroupAddClick: function(button,e,eOpts) {
                   var grpname=Ext.getCmp('preliminary-group-name');
                   var store=this.getResultsGrouppingStore();

                   grpname.allowBlank=false;
                   grpname.validate();
                   if(!grpname.isValid())
                       return false;

                   button.setDisabled(true);

                   var r = Ext.create('EMS.model.ResultsGroupping', {
                                          item: grpname.getValue(),
                                          project_id: this.PreliminaryEdit.project_id
                                      });
                   store.getRootNode().appendChild(r);
                   store.sync({success: function (batch, options) { store.load(); button.setDisabled(false);}});
                   grpname.allowBlank=true;
                   grpname.setValue('');
               },
               onSaveClick: function(button,e,eOpts) {
                   this.getResultsGrouppingStore().sync();
               },
               /*
                 Project window
                 */
               onProjectWindowRendered: function(view) {
                   this.getProjectStore().getProxy().setExtraParam('workerid',USER_ID);
                   var store=this.getProjectStore();
                   store.load();
               },
               onProjectAddClick:function(button,e,eOpts) {
                   var prjname=Ext.getCmp('project-name');
                   var store=this.getProjectStore();

                   prjname.allowBlank=false;
                   prjname.validate();
                   if(!prjname.isValid())
                       return false;

                   button.setDisabled(true);

                   var r = Ext.create('EMS.model.Project', {
                                          name: prjname.getValue(),
                                          worker_id: USER_ID
                                      });
                   prjname.allowBlank=true;
                   prjname.setValue('');
                   store.insert(0,r);
                   store.sync({success: function (batch, options) { store.load(); button.setDisabled(false); }});
               },
               ProjectListWindowGridDblClick: function( view,record,item,index,e,eOpts ) {
                   //Logger.log(record);
                   //Logger.log(view);
                   var me=this;
                   var resStore=me.getResultsGrouppingStore();
                   resStore.getProxy().setExtraParam('projectid',record.data['id']);
                   resStore.load();

                   this.PreliminaryEdit = Ext.create('EMS.view.Project.Preliminary', {
                                                         project_id: record.data['id'],
                                                         title: 'Add Preliminary Results to '+record.data['name'],
                                                         project_name: record.data['name'],
                                                         resultStore: resStore });
                   this.PreliminaryEdit.show();
               }
           });
