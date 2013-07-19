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
               models: ['LabData','Worker','RPKM','ResultsGroupping','RType','AType','ProjectTree','AnalysisGroup','Result','PCAChart','ATPChart','Condition'],
               stores: ['LabData','Worker','RPKM','ResultsGroupping','RType','AType','ProjectTree','AnalysisGroup','Result','PCAChart','ATPChart','Condition'],
               views:  ['Project2.ProjectDesigner','charts.ATP'],

               init: function() {
                   var me=this;
                   me.atype=undefined;
                   me.control({
                                  'ProjectDesigner': {
                                      render: me.onProjectDesignerWindowRendered,
                                      startAnalysis: me.startAnalysis
                                  },
                                  '#project2-project-list': {
                                      select: me.onProjectSelect
                                  }
                              });
               },//init
               onProjectDesignerWindowRendered: function(view) {
               },

               /*************************************************************
                *************************************************************/
               onProjectSelect: function(selModel,record) {
                   var me=this;

                   if (record.get('type')===1) {//project

                       var bd = Ext.getCmp('project2-details-panel').body;
                       bd.update('').setStyle('background','#fff');
                       detailEl = bd.createChild();

                       var worker=this.getWorkerStore().findRecord('id',record.get('worker_id'),0,false,false,true).data.fullname;
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
                       console.log('genelist');
                       break;
                   }
                   //console.log('click',data.projectid,data.atypeid);
               }
           });
