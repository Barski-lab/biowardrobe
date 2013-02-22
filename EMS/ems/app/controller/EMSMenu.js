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

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onEMSMenuForms: function(menuitem,e,opt) {


                   Logger.log('Menu item \''+menuitem.action+'\' choosed.');

                   if(menuitem.action === "LabData"){
                       if(typeof this.ExperimentsWindow === 'undefined' || !this.ExperimentsWindow){
                           this.ExperimentsWindow=Ext.create('EMS.view.ExperimentsWindow.Main',{});
                           Ext.getCmp('EMSMenu').add(this.ExperimentsWindow);
                       }
                       if(this.ExperimentsWindow.isVisible()){
                           this.ExperimentsWindow.focus(); }
                       else {
                           this.ExperimentsWindow.show(); }
                   }

                   /*
                     Create window with workers list
                   */
                   if(menuitem.action === "Workers"){
                       if(typeof this.WorkersEditWindow === 'undefined' || !this.WorkersEditWindow){
                           this.WorkersEditWindow=Ext.create('EMS.view.WorkersEdit',{});
                           Ext.getCmp('EMSMenu').add(this.WorkersEditWindow);
                       }
                       if(this.WorkersEditWindow.isVisible()){
                           this.WorkersEditWindow.focus(); }
                       else {
                           this.WorkersEditWindow.show(); }
                   }
                   if(menuitem.action === "Worker"){
                           this.WorkerEditWindow=this.getController('WorkersEdit').edit();
                           Ext.getCmp('EMSMenu').add(this.WorkerEditWindow);
//                       if(this.WorkerEditWindow.isVisible()){
//                           this.WorkerEditWindow.focus(); }
//                       else {
//                           this.WorkerEditWindow.show(); }
                   }

                   /*
                     Create window with antibodies list
                   */
                   if(menuitem.action === "Antibodies"){
                       if(typeof this.AntibodiesEditWindow === 'undefined' || !this.AntibodiesEditWindow){
                           this.AntibodiesEditWindow=Ext.create('EMS.view.Antibodies.Antibodies',{});
                           Ext.getCmp('EMSMenu').add(this.AntibodiesEditWindow);
                       }
                       if(this.AntibodiesEditWindow.isVisible()){
                           this.AntibodiesEditWindow.focus(); }
                       else {
                           this.AntibodiesEditWindow.show(); }
                   }
                   /*
                     Create window with Experiment Type list
                   */
                   if(menuitem.action === "ExpType"){
                       if(typeof this.ExpTypeEditWindow === 'undefined' || !this.ExpTypeEditWindow){
                           this.ExpTypeEditWindow=Ext.create('EMS.view.ExperimentType.ExperimentType',{});
                           Ext.getCmp('EMSMenu').add(this.ExpTypeEditWindow);
                       }
                       if(this.ExpTypeEditWindow.isVisible()){
                           this.ExpTypeEditWindow.focus(); }
                       else {
                           this.ExpTypeEditWindow.show(); }
                   }
                   /*
                     Create window with Crosslink list
                   */
                   if(menuitem.action === "CrossType"){
                       if(typeof this.CrosslinkEditWindow === 'undefined' || !this.CrosslinkEditWindow){
                           this.CrosslinkEditWindow=Ext.create('EMS.view.Crosslink.Crosslink',{});
                           Ext.getCmp('EMSMenu').add(this.CrosslinkEditWindow);
                       }
                       if(this.CrosslinkEditWindow.isVisible()){
                           this.CrosslinkEditWindow.focus(); }
                       else {
                           this.CrosslinkEditWindow.show(); }
                   }
                   /*
                     Create window
                   */
                   if(menuitem.action === "SeqCut"){
                       if(typeof this.SeqCutWindow === 'undefined' || !this.SeqCutWindow){
                           this.SeqCutWindow=Ext.create('EMS.view.SequenceCutter.MainWindow',{});
                           Ext.getCmp('EMSMenu').add(this.SeqCutWindow);
                       }
                       if(this.SeqCutWindow.isVisible()){
                           this.SeqCutWindow.focus(); }
                       else {
                           this.SeqCutWindow.show(); }
                   }

                   /*
                     Create window with Fragmentation list
                   */
                   if(menuitem.action === "FragmentType"){
                       if(typeof this.FragmentationEditWindow === 'undefined' || !this.FragmentationEditWindow){
                           this.FragmentationEditWindow=Ext.create('EMS.view.Fragmentation.Fragmentation',{});
                           Ext.getCmp('EMSMenu').add(this.FragmentationEditWindow);
                       }
                       if(this.FragmentationEditWindow.isVisible()){
                           this.FragmentationEditWindow.focus(); }
                       else {
                           this.FragmentationEditWindow.show(); }
                   }
                   /*
                     Create window with Genome list
                   */
                   if(menuitem.action === "GenomeType"){
                       if(typeof this.GenomeEditWindow === 'undefined' || !this.GenomeEditWindow){
                           this.GenomeEditWindow=Ext.create('EMS.view.Genome.Genome',{});
                           Ext.getCmp('EMSMenu').add(this.GenomeEditWindow);
                       }
                       if(this.GenomeEditWindow.isVisible()){
                           this.GenomeEditWindow.focus(); }
                       else {
                           this.GenomeEditWindow.show(); }
                   }

                   /*
                     Create chart window for adaptor contamination
                   */
                   if(menuitem.action === "AdaptorCont"){
                       if(typeof this.FenceChartWindow === 'undefined' ||!this.FenceChartWindow){
                           this.FenceChartWindow=Ext.create('EMS.view.charts.Fence',{});
                           Ext.getCmp('EMSMenu').add(this.FenceChartWindow);
                       }
                       if(this.FenceChartWindow.isVisible()){
                           this.FenceChartWindow.focus(); }
                       else {
                           this.FenceChartWindow.show(); }
                   }

                   /*
                     Create window for average tag density
                   */
                   if(menuitem.action === "ATD"){

                       win=Ext.create('Ext.window.Window', {
                                          width: 800,
                                          minWidth: 200,
                                          height: 600,
                                          title: 'Average Tag Density',
                                          closable: true,
                                          maximizable: true,
                                          //    closeAction: 'hide',
                                          constrain: true,
                                          layout: 'fit',
                                          items: [{
                                                  xtype: 'uxiframe',
                                                  src: 'http://localhost/TE7_IL13_2hr_6hr.svg'
                                              }]
                                      });

                       Ext.getCmp('EMSMenu').add(win);
                       win.show();
                   }

                   /*
                     Create window for genome browser
                   */
                   if(menuitem.action === "GenomeBrowser"){

                       win=Ext.create('Ext.window.Window', {
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

                   Logger.log('Menu item \''+menuitem.action+'\' loaded.', 'green');

               }
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------

           });
