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

Ext.Loader.setPath({'Ext.ux': 'ux/'});


Ext.require([
                'Ext.ux.IFrame'
            ]);


Ext.define('EMS.controller.EMSMenu', {
               extend: 'Ext.app.Controller',

               views:['EMSMenu'],
               init: function() {
                   this.control({
                                    'viewport > EMSMenu': {
                                        render: this.onPanelRendered
                                    },
                                    'EMSMenu button > menuitem': {
                                        click: this.onEMSMenuForms
                                    }
                                });

               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onPanelRendered: function() {
                   //Logger.log('The panel was rendered');
                   Ext.getCmp('MenuWorkers').setVisible(USER_GNAME==="porter");
               },

               createWindow: function(WinVar,Widget,Params) {
                   if(typeof WinVar === 'undefined' || !WinVar){
                       WinVar=Ext.create(Widget,Params);
                       Ext.getCmp('EMSMenu').add(WinVar);
                   }
                   if(WinVar.isVisible()) {
                       WinVar.focus();
                   } else {
                       WinVar.show();
                   }
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onEMSMenuForms: function(menuitem,e,opt) {
                   var me=this;
                   if(menuitem.action === "LabData"){
                       me.createWindow(me.ExperimentsWindow,'EMS.view.ExperimentsWindow.Main',{});
                   }
                   if(menuitem.action === "Workers"){
                       me.createWindow(me.WorkersEditWindow,'EMS.view.WorkersEdit',{});
                   }
                   if(menuitem.action === "Worker"){
                           me.WorkerEditWindow=me.getController('WorkersEdit').edit();
                           Ext.getCmp('EMSMenu').add(me.WorkerEditWindow);
                   }
                   if(menuitem.action === "Antibodies"){
                       me.createWindow(me.AntibodiesEditWindow,'EMS.view.Antibodies.Antibodies',{});
                   }
                   if(menuitem.action === "ExpType"){
                       me.createWindow(me.ExpTypeEditWindow,'EMS.view.ExperimentType.ExperimentType',{});
                   }
                   if(menuitem.action === "CrossType"){
                       me.createWindow(me.CrosslinkEditWindow,'EMS.view.Crosslink.Crosslink',{});
                   }
                   if(menuitem.action === "SeqCut"){
                       me.createWindow(me.SeqCutWindow,'EMS.view.SequenceCutter.MainWindow',{});
                   }
                   if(menuitem.action === "FragmentType"){
                       me.createWindow(me.FragmentationEditWindow,'EMS.view.Fragmentation.Fragmentation',{});
                   }
                   if(menuitem.action === "GenomeType"){
                       me.createWindow(me.GenomeEditWindow,'EMS.view.Genome.Genome',{});
                   }
                   if(menuitem.action === "EGIDPatients"){
                       me.createWindow(me.PatientsWindow,'EMS.view.Patients.MainWindow',{});
                   }
                   if(menuitem.action === "SuppInfo"){
                       me.createWindow(me.SuppInfoWindow,'EMS.view.Info.Supplemental',{});
                   }
                   /*
                     Create window for genome browser
                   */
                   if(menuitem.action === "GenomeBrowser"){
                       var win=Ext.create('Ext.window.Window', {
                                          width: 1000,
                                          minWidth: 200,
                                          height: 600,
                                          title: 'Genome Browser',
                                          closable: true,
                                          maximizable: true,
                                          constrain: true,
                                          layout: 'fit',
                                          items: [{
                                                  xtype: 'uxiframe',
                                                  //                                                  src: 'http://genome.ucsc.edu/cgi-bin/hgTracks?bd=hg19&pix=1000&run0156_lane2_read1_index1_TE7_cont_H3K27me3_ab6002_fastq=full'
                                                  src: 'https://genomebrowser.research.cchmc.org/cgi-bin/hgTracks?bd=hg19&pix=1000&run0156_lane2_read1_index1_TE7_cont_H3K27me3_ab6002_fastq=full'
                                              }]
                                      });

                       Ext.getCmp('EMSMenu').add(win);
                       win.show();
                   }
               }
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------

           });
