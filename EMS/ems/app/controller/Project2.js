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

Ext.define('EMS.controller.Project2', {
               extend: 'Ext.app.Controller',
               models: ['ProjectLabData','Worker','RPKM','ResultsGroupping','RType','AType','ProjectTree','AnalysisGroup','GeneList','PCAChart','ATPChart'],
               stores: ['ProjectLabData','Worker','RPKM','ResultsGroupping','RType','AType','ProjectTree','AnalysisGroup','GeneList','PCAChart','ATPChart'],
               views:  ['Project2.ProjectDesigner','Project2.GenesLists','Project2.Filter','charts.ATP'],

               init: function() {
                   var me=this;
                   me.atype=undefined;
                   me.control({
                                  'ProjectDesigner': {
                                      render: me.onProjectDesignerWindowRendered,
                                      startAnalysis: me.startAnalysis,
                                  },
                                  '#Project2GenesLists': {
                                      Back: me.onBack,
                                      groupadd: me.onGroupAdd,
                                      filter: me.filterApply
                                  },
                                  '#project2-project-list': {
                                      select: me.onProjectSelect
                                  },
                                  '#project-worker-changed': {
                                      select: me.onComboboxWorkerSelect
                                  },
                                  '#projectgenelisttree': {
                                      edit: me.onGeneListEdit,
                                      beforeedit: me.onGeneListBeforeedit,
                                      select: me.onGeneListSelect
                                  },
                                  '#projectgenelisttree > treeview': {
                                      beforedrop: me.beforeGeneListDrop,
                                      drop: me.GeneListDrop
                                  }

                              });
               },//init
               onProjectDesignerWindowRendered: function(view) {
               },
               /*************************************************************
                *************************************************************/
               onBack: function() {
                   var mainPanel=Ext.getCmp('ProjectDesigner');
                   mainPanel.restoreCenter();
               },
               /*************************************************************
                *************************************************************/
               onProjectSelect: function(selModel,record) {
                   var me=this;
                   var mainPanel=Ext.getCmp('ProjectDesigner');

                   if (record.get('type')===1) {//project

                       var bd = Ext.getCmp('project2-details-panel').body;
                       bd.update('').setStyle('background','#fff');
                       detailEl = bd.createChild();

                       var worker=this.getWorkerStore().findRecord('id',record.get('worker_id'),0,false,false,true).data.fullname;
                       mainPanel.restoreCenter();
                       if(!me.atype) {
                           me.atype=me.getATypeStore();
                           me.atype.load({
                                             callback: function(records, operation, success) {
                                                 if(success) {
                                                     me.UpdateAddAnalysis(records,record);
                                                 }
                                             }});
                       } else {
                           me.UpdateAddAnalysis(me.atype.data.items,record);
                       }
                       detailEl.hide().update('<p padding=5>'+
                                              '&nbsp;Project by: <b>'+worker+'</b><br>'+
                                              '&nbsp;Project date: <b>'+Ext.util.Format.date(record.get('dateadd'),'m/d/Y')+'</b><br>'+
                                              '&nbsp;Description: <br>&nbsp;<i>'+record.get('description')+'</i><br>'
                                              +'</p>').
                       slideIn('l', {stopAnimation:true,duration: 200});
                   }//if project
               },
               /*************************************************************
                *************************************************************/
               UpdateAddAnalysis: function(records,record) {
                   var panel=Ext.getCmp('ProjectDesigner');
                   this.projectid=record.get('id');

                   for(var i=0; i<records.length;i++) {
                       if(records[i].data.implemented===0)
                           continue;
                       panel.addAnalysis({
                                             name:records[i].data.name,
                                             description:records[i].data.description,
                                             imgsrc:records[i].data.imgsrc,
                                             id:records[i].data.id,
                                             implemented:records[i].data.implemented,
                                             prjid:record.get('id')
                                         });
                   }
               },
               /*************************************************************
                *************************************************************/
               startAnalysis: function(data) {
                   var me=this;
                   var mainPanel=Ext.getCmp('ProjectDesigner');
                   var resStore=me.getGeneListStore();
                   var RTypeStore=me.getRTypeStore();
                   var labStore=me.getProjectLabDataStore();

                   switch(data.atypeid) {
                   case 1://DEseq
                       break;
                   case 2://PCA
                       break;
                   case 3://DESeq2
                       break;
                   case 4://ATP
                       break;
                   case 5://MANorm
                       break;
                   case 6://GeneList
                       labStore.getProxy().setExtraParam('isrna',1);
                       labStore.load();
                       resStore.getProxy().setExtraParam('projectid',data.projectid);
                       resStore.load();
                       RTypeStore.load();

                       var gl=Ext.create('EMS.view.Project2.GenesLists',{
                                             labDataStore: labStore,
                                             resultStore: resStore,
                                             RTypeStore: RTypeStore,
                                             projectid: data.projectid
                                         });
                       mainPanel.replaceCenter(gl);
                       break;
                   }
               },

               /*************************************************************
                *************************************************************/
               onComboboxWorkerSelect: function(combo, records, options) {
                   this.getProjectLabDataStore().getProxy().setExtraParam('workerid',Ext.getCmp('project-worker-changed').getValue());
                   Ext.getCmp('Project2GenesLists').m_PagingToolbar.moveFirst()
               },

               /*************************************************************
                *************************************************************/
               beforeGeneListDrop: function(node, data, overModel, dropPosition, dropHandlers) {
                   var me=this;
                   dropHandlers.wait = true;

                   if( (dropPosition !== 'append' && overModel.data.leaf === false)
                           || overModel.data.id === 'gl'
                           || overModel.data.root === true) {
                       dropHandlers.cancelDrop();
                       return false;
                   }

                   overModel.expand(false,function() {
                       var base=overModel.childNodes.length;

                       for(var i=0; i<data.records.length;i++) {
                           var cont=false;
                           for(var j=0; j<base;j++) {
                               if (typeof data.records[i].data.leaf!='undefined' && !data.records[i].data.leaf) {
                                   dropHandlers.cancelDrop();
                                   return false;
                               }
                               if(data.records[i].data.id===overModel.childNodes[j].data.labdata_id) {
                                   data.records.splice(i,1);
                                   cont=true;
                                   i--;
                                   break;
                               }
                           }
                           if(cont) continue;

                           var uuid=generateUUID();

                           if(typeof data.records[i].data.name4browser !== 'undefined') {
                               data.records[i].set('name', data.records[i].data.name4browser);
                               data.records[i].set('item_id',uuid);
                               data.records[i].set('labdata_id',data.records[i].data.id);
                               data.records[i].set('project_id',me.projectid);
                               data.records[i].set('expanded',false);
                               data.records[i].set('isnew',true);
                           } else {
                               data.records[i].set('item_id',data.records[i].data.id);
                               data.records[i].set('isnew',false);
                           }
                           data.records[i].set('parent_id',overModel.data.id);
                           data.records[i].set('leaf', true);
                           data.records[i].set('type',1);
                       }
                       dropHandlers.processDrop();
                   });

                   return true;
               },//beforeGeneListDrop

               /*************************************************************
                *************************************************************/
               GeneListDrop: function(node, data, overModel, dropPosition, eOpts) {
                   for(var i=0; i<data.records.length;i++) {
                       //console.log(data.records[i]);
                       if(data.records[i].data.isnew)
                           data.records[i].data.id=data.records[i].raw.item_id;
                   }
                   this.getGeneListStore().sync();
               },

               /*************************************************************
                *************************************************************/
               onGroupAdd: function(field,event) {
                   var me=this;
                   var grpname=field[0];
                   grpname.allowBlank=false;
                   grpname.validate();
                   if(!grpname.isValid())
                       return false;

                   var store=me.getGeneListStore();
                   var uuid=generateUUID();
                   var r = Ext.create('EMS.model.GeneList', {
                                          id: uuid,
                                          item_id: uuid,
                                          name: grpname.getValue(),
                                          type: 1,
                                          isnew: true,
                                          leaf: false,
                                          expanded: true,
                                          project_id: me.projectid
                                      });
                   store.getRootNode().getChildAt(0).appendChild(r);
                   store.sync();
                   //console.log(store.getRootNode().getChildAt(0));
                   grpname.allowBlank=true;
                   grpname.setValue(undefined);
               },

               /*************************************************************
                *************************************************************/
               filterApply: function(grid,rowIndex,colIndex,actionItem,event,record,row) {
                   var me=this;
                   var filterForm=Ext.create('EMS.view.Project2.Filter',{
                                                 modal: true,
                                                 item_id: record.data.item_id,
                                                 tables: me.getGeneListStore().getRootNode(),
                                                 onSubmit: function() {
                                                     me.filterSubmit(filterForm,record);
                                                 }
                                             }).show();

               },
               filterSubmit: function(form,record) {
                   var me=this;
                   var uuid=generateUUID();
                   var formData=form.getFormJson();
                   Ext.Ajax.request({
                                        url: 'data/FilterSetPrjAdd.php',
                                        method: 'POST',
                                        success: function(response) {
                                            var json = Ext.decode(response.responseText);
                                            if(json.success) {
                                                var store=me.getGeneListStore();
                                                var r = Ext.create('EMS.model.GeneList', {
                                                                       id: uuid,
                                                                       item_id: uuid,
                                                                       name: formData[0].name,
                                                                       type: 2,
                                                                       isnew: false,
                                                                       leaf: true,
                                                                       project_id: me.projectid
                                                                   });
                                                store.getRootNode().getChildAt(1).appendChild(r);
                                                r.commit();
                                                form.close();
                                            } else {
                                                Logger.log("Cant add filter error: "+json.message);
                                                form.close();
                                            }
                                        },
                                        failure: function() {
                                        },
                                        jsonData: Ext.encode({
                                                                 "project_id": me.projectid,
                                                                 "uuid": uuid,
                                                                 "filters": formData
                                                             })
                                    });

               },
               /*************************************************************
                *************************************************************/
               onGeneListEdit: function(editor,e) {
                   e.record.save();
               },
               /*************************************************************
                *************************************************************/
               onGeneListBeforeedit: function(editor,e) {
                   if(e.record.data.parentId==='root')
                       return false;
               },
               /*************************************************************
                *************************************************************/
               onGeneListSelect: function(rowmodel, record, index){
                   //console.log(arguments);
                   var panel=Ext.getCmp('genelist-details-panel');
                   var bd = panel.body;
                   if(record.get('parentId')==='gl') {
                       panel.expand(500);

                       bd.update('').setStyle('background','#fff');
                       detailEl = bd.createChild();
                       detailEl.hide().update('<div align="left" style="margin-right:5px; margin-left: 5px; padding: 0; line-height:1.5em; ">'+
                                              'Conditions:<br>'+
                                              '<div align="justify" style="margin-left: 5px; padding: 0; line-height:1.5em; "><i>'+record.get('conditions')+'</i></div>'
                                              +'</div>').
                       slideIn('l', {stopAnimation:true,duration: 200});
                   } else {
                       panel.collapse();
                   }
               }
           });

