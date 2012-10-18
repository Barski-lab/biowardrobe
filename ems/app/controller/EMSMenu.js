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

var ExperimentsWindow,WorkersEditWindow,FenceChartWindow;//,AntibodiesEditWindow;

//Ext.require('EMS.view.ExperimentsWindow');

Ext.define('EMS.controller.EMSMenu', {
               extend: 'Ext.app.Controller',

               views:['EMSMenu'],
               init: function()
               {
                   Logger.log('Menu Initialized!');
                   this.control({
                                    //                                    'viewport > EMSMenu': {
                                    //                                        render: this.onPanelRendered
                                    //                                    },
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
                   Logger.log('The panel was rendered');
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onEMSMenuForms: function(menuitem,e,opt) {


                   Logger.log('Menu item \''+menuitem.action+'\' choosed.');

                   if(menuitem.action === "LabData"){
                       if(!ExperimentsWindow){
                           ExperimentsWindow=Ext.create('EMS.view.ExperimentsWindow.Main',{});
                           Ext.getCmp('EMSMenu').add(ExperimentsWindow);
                       }
                       if(ExperimentsWindow.isVisible()){
                           ExperimentsWindow.hide(); }
                       else {
                           ExperimentsWindow.show(); }
                   }

                   /*
                     Create window with workers list
                   */
                   if(menuitem.action === "Workers"){
                       if(!WorkersEditWindow){
                           WorkersEditWindow=Ext.create('EMS.view.WorkersEdit',{});
                           Ext.getCmp('EMSMenu').add(ExperimentsWindow);
                       }
                       if(WorkersEditWindow.isVisible()){
                           WorkersEditWindow.hide(); }
                       else {
                           WorkersEditWindow.show(); }
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
                           this.AntibodiesEditWindow.hide(); }
                       else {
                           this.AntibodiesEditWindow.show(); }
                   }

                   /*
                     Create chart window for adaptor contamination
                   */
                   if(menuitem.action === "AdaptorCont"){
                       if(!FenceChartWindow){
                           FenceChartWindow=Ext.create('EMS.view.charts.Fence',{});
                           Ext.getCmp('EMSMenu').add(FenceChartWindow);
                       }
                       if(FenceChartWindow.isVisible()){
                           FenceChartWindow.hide(); }
                       else {
                           FenceChartWindow.show(); }

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
