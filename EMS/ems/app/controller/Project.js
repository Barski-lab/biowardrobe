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
               models: ['LabData','Worker','RPKM','ResultsGroupping','RType','AType','Project','AnalysisGroup','Result','PCAChart','ATPChart','Condition'],
               stores: ['LabData','Worker','RPKM','ResultsGroupping','RType','AType','Project','AnalysisGroup','Result','PCAChart','ATPChart','Condition'],
               views:  ['Project.Preliminary','Project.ProjectList','Project.ProjectDesign','charts.PCA','ProgressBar',
                   'charts.ATP'],

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
                                  },
                                  '#project-add': {
                                      click: me.onProjectAddClick
                                  },
                                  'ProjectListWindow grid': {
                                      //selectionchange: this.onSelectionChanged,
                                      itemdblclick: me.ProjectListWindowGridDblClick
                                  },
                                  /*
                                    Project Design
                                    */
                                  '#projectdesign-preliminary-button': {
                                      click: me.onProjectDesignPreliminaryClick
                                  },
                                  '#ProjectDesign': {
                                      render: me.onProjectDesignWindowRendered,
                                      startAnalysis: me.startAnalysis
                                  },
                                  '#ProjectDesign grid': {
                                      itemdblclick: me.ProjectDesignWindowGridDblClick
                                  },
                                  '#analyse-add': {
                                      click: me.onAnalyseAddClick
                                  }
                              });
               },
               syncCombosAndGrid:function() {
                   this.getRTypeStore().load();
                   this.getLabDataStore().loadData([],false);
                   if(Ext.getCmp('preliminary-type-changed').getValue()===0 || Ext.getCmp('preliminary-type-changed').getValue() === null) return;
                   this.getLabDataStore().getProxy().setExtraParam('workerid',Ext.getCmp('preliminary-worker-changed').getValue());
                   this.getLabDataStore().getProxy().setExtraParam('typeid',Ext.getCmp('preliminary-type-changed').getValue());
                   this.getLabDataStore().sort('id', 'ASC');

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
                   if(Ext.getCmp('preliminary-type-changed').getValue()===0 || Ext.getCmp('preliminary-type-changed').getValue() === null) return;
                   this.getLabDataStore().loadData([],false);
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

                   var r = Ext.create('EMS.model.ResultsGroupping', {
                                          item: grpname.getValue(),
                                          leaf: false,
                                          iconCls: 'folder-into',
                                          expanded: true,
                                          project_id: this.PreliminaryEdit.project_id
                                      });
                   store.getRootNode().appendChild(r);
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
                   var store=this.getProjectStore();
                   if(!Rights.check(USER_ID,'projectlist')) {
                       store.getProxy().setExtraParam('workerid',USER_ID);
                   }
                   store.load();
               },
               onProjectAddClick: function(button,e,eOpts) {
                   var prjname=Ext.getCmp('project-name');
                   var store=this.getProjectStore();

                   prjname.allowBlank=false;
                   prjname.validate();
                   if(!prjname.isValid())
                       return false;

                   button.setDisabled(true);

                   var r = Ext.create('EMS.model.Project', {
                                          name: prjname.getValue(),
                                          dateadd: Ext.Date.format(new Date(), 'm/d/Y'),
                                          worker_id: USER_ID
                                      });
                   prjname.allowBlank=true;
                   prjname.setValue('');
                   store.insert(0,r);
                   store.sync({success: function (batch, options) { store.load(); button.setDisabled(false); }});
               },
               ProjectListWindowGridDblClick: function( view,record,item,index,e,eOpts ) {
                   //console.log(record);
                   //console.log(view);
                   var me=this;
                   var resStore=me.getResultsGrouppingStore();
                   resStore.getProxy().setExtraParam('projectid',record.data['id']);
                   resStore.load();
                   var resultStore=me.getResultStore();
                   resultStore.getProxy().setExtraParam('projectid',record.data['id']);
                   resultStore.load();
                   var aStore=me.getAnalysisGroupStore();
                   aStore.getProxy().setExtraParam('projectid',record.data['id']);
                   aStore.load();
                   var atStore=me.getATypeStore();
                   atStore.load();
                   me.project_id=record.data['id'];
                   this.ProjectDesignEdit = Ext.create('EMS.view.Project.ProjectDesign', {
                                                           project_id: record.data['id'],
                                                           title: 'Designing '+record.data['name'],
                                                           project_name: record.data['name'],
                                                           resultGrpStore: resStore,
                                                           resultStore: resultStore,
                                                           analysisStore: aStore,
                                                           atStore: atStore });
                   var funct=function() {
                       this.ProjectDesignEdit.show();
                   };
                   atStore.on('load',funct,me,{ single: true });
               },

               /*
                 Project design
                 */
               onProjectDesignPreliminaryClick: function(button,e,eOpts) {
                   var win=button.up('window');
                   var resStore=this.getResultsGrouppingStore();

                   this.PreliminaryEdit = Ext.create('EMS.view.Project.Preliminary', {
                                                         project_id: win.project_id,
                                                         title: 'Add Preliminary Results to '+win.project_name,
                                                         project_name: win.project_name,
                                                         resultStore: resStore
                                                     });
                   this.PreliminaryEdit.show();

               },
               onProjectDesignWindowRendered: function(view) {
                   this.getRTypeStore().load();
               },
               onAnalyseAddClick: function(button,e,eOpts) {
                   var win=button.up('window');
                   var acaption=Ext.getCmp('analyse-caption');
                   var atype=Ext.getCmp('analyse-type');
                   var aStore=this.getAnalysisGroupStore();

                   acaption.allowBlank=false;
                   acaption.validate();
                   if(!acaption.isValid() || !atype.isValid())
                       return false;

                   var r = Ext.create('EMS.model.AnalysisGroup', {
                                          item: acaption.getValue(),
                                          project_id: win.project_id,
                                          status: 0,
                                          leaf: false,
                                          iconCls:'folder-into',
                                          atype_id: atype.getValue()
                                      });
                   aStore.getRootNode().appendChild(r);

                   acaption.allowBlank=true;
                   acaption.setValue('');
               },

               startAnalysis: function(args) {
                   var me=this;
                   var grid=args[0];
                   var record=args[5];
                   var resultStore=me.getResultStore();
                   var model=Ext.create('EMS.model.Result', {
                                            name: record.data.item+'_result',
                                            description: record.data.item+'_result',
                                            atype_id: record.data.atype_id,
                                            ahead_id: record.data.item_id,
                                            project_id: me.project_id
                                        });
                   resultStore.insert(0,model);
                   me.progress=Ext.create('EMS.view.ProgressBar',{modal:true});
                   me.progress.show();
                   Ext.WindowMgr.bringToFront(this.progress);

                   resultStore.sync({
                                        success:function(){
                                            record.data.status=2;
                                            resultStore.load(function (batch, options){
                                                var resStore=me.getResultsGrouppingStore();
                                                resStore.load();
                                                var aStore=me.getAnalysisGroupStore();
                                                aStore.load();
                                            });
                                            me.progress.progress.reset();
                                            me.progress.close();
                                        },
                                        failure:function(){
                                            record.data.status=1;
                                            me.progress.close();
                                        }});
               },

               ProjectDesignWindowGridDblClick:  function( view,record,item,index,e,eOpts ) {
                   var me=this;
                   switch(record.data.atype_id) {
                   case 2:
                       var store=me.getPCAChartStore();
                       store.getProxy().setExtraParam('resultid',record.data['id']);
                       store.load();
                       me.PCA = Ext.create('EMS.view.charts.PCA', {
                                               //project_id: win.project_id,
                                               title: 'Principle Component Analysis '//+win.project_name,
                                               //project_name: win.project_name,
                                               //resultStore: resStore
                                           });
                       me.PCA.show();
                       break;
                   case 4:
                       var storc=this.getConditionStore();
                       storc.getProxy().setExtraParam('ahead_id',record.data['id']);
                       storc.load();
                       var stor=this.getATPChartStore();
                       stor.getProxy().setExtraParam('tablename',record.data['tableName']);
                       stor.load({
                                     callback: function(records, operation, success) {
                                         if(success) {
                                             var title=[];
                                             for(var c=0; c<storc.getTotalCount();c++) {
                                                 title.push(storc.getAt(c).raw['name']);
                                             }
                                             //console.log(storc);
                                             //console.log(title);
                                             var cols=0;
                                             var prop=[];
                                             for(p in records[0].data) {
                                                 if(cols>0) prop[cols-1]=p;
                                                 cols++;
                                             }
                                             cols--;
                                             var len=Math.abs(records[0].data.X);
                                             var max=records[0].data[prop[0]];
                                             for(var i=0;i<records.length;i++) {
                                                 for(var j=0;j<cols;j++)
                                                     if(records[i].data[prop[j]]>max)
                                                         max=records[i].data[prop[j]];
                                             }
                                             var prc=Math.abs(parseInt(max.toString().split('e')[1]))+2;
                                             var ATPChart = Ext.create("EMS.view.Project.ATPChart",{LEN: len, MAX: max, PRC: prc, BNAME: title, COLS:cols, COLSN:prop});
                                             ATPChart.show();
                                         }
                                     }
                                 });

                       break;
                   }

               }
           });
