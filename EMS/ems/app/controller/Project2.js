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
               models: ['ProjectLabData','Worker','RPKM','ResultsGroupping','RType','AType','ProjectTree','AnalysisGroup','Result','PCAChart','ATPChart','Condition'],
               stores: ['ProjectLabData','Worker','RPKM','ResultsGroupping','RType','AType','ProjectTree','AnalysisGroup','Result','PCAChart','ATPChart','Condition'],
               views:  ['Project2.ProjectDesigner','Project2.GenesLists','charts.ATP'],

               init: function() {
                   var me=this;
                   me.atype=undefined;
                   me.control({
                                  'ProjectDesigner': {
                                      render: me.onProjectDesignerWindowRendered,
                                      startAnalysis: me.startAnalysis,
                                  },
                                  '#Project2GenesLists': {
                                      Back: me.onBack
                                  },
                                  '#project2-project-list': {
                                      select: me.onProjectSelect
                                  },
                                  '#project-worker-changed': {
                                      select: me.onComboboxWorkerSelect
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
                       var labStore=me.getProjectLabDataStore();
                       labStore.getProxy().setExtraParam('isrna',1);
                       labStore.load();
                       var gl=Ext.create('EMS.view.Project2.GenesLists',{labDataStore: labStore});
                       mainPanel.replaceCenter(gl);
                       break;
                   }
                   //console.log('click',data.projectid,data.atypeid);
               },

               //               syncCombosAndGrid:function() {
               //                   this.getRTypeStore().load();
               //                   this.getLabDataStore().loadData([],false);
               //                   if(Ext.getCmp('preliminary-type-changed').getValue()===0 || Ext.getCmp('preliminary-type-changed').getValue() === null) return;
               //                   this.getLabDataStore().getProxy().setExtraParam('workerid',Ext.getCmp('preliminary-worker-changed').getValue());
               //                   this.getLabDataStore().getProxy().setExtraParam('typeid',Ext.getCmp('preliminary-type-changed').getValue());
               //                   this.getLabDataStore().sort('id', 'ASC');

               //                   Ext.getCmp('ProjectPreliminary').m_PagingToolbar.moveFirst()
               //               },
               onComboboxWorkerSelect: function(combo, records, options) {
                   this.getProjectLabDataStore().getProxy().setExtraParam('workerid',Ext.getCmp('project-worker-changed').getValue());
                   Ext.getCmp('Project2GenesLists').m_PagingToolbar.moveFirst()
               },

           });
