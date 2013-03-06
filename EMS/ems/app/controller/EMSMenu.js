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
               windowList: new Array(),
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
                   Ext.getCmp('MenuWorkers').setVisible(Rights.check('MenuWorkers'));
               },

               createWindow: function(WinVar,Widget,Params) {
                   var me=this;

                   if(!(WinVar in me.windowList) || me.windowList[WinVar] === 'undefined') {
                       me.windowList[WinVar]=Ext.create(Widget,Params);
                       Ext.getCmp('EMSMenu').add(me.windowList[WinVar]);

                       me.windowList[WinVar].on('destroy', function() {
                           me.windowList[WinVar]='undefined';
                       });
                   }

                   if(me.windowList[WinVar].isVisible()) {
                       me.windowList[WinVar].focus();
                   } else {
                       me.windowList[WinVar].show();
                   }
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onEMSMenuForms: function(menuitem,e,opt) {
                   var me=this;
                   if(menuitem.action === "LabData"){
                       me.createWindow(menuitem.action,'EMS.view.ExperimentsWindow.Main',{});
                   }
                   if(menuitem.action === "Workers"){
                       me.createWindow(menuitem.action,'EMS.view.WorkersEdit',{});
                   }
                   if(menuitem.action === "Worker"){
                       me.WorkerEditWindow=me.getController('WorkersEdit').edit();
                       Ext.getCmp('EMSMenu').add(me.WorkerEditWindow);
                   }
                   if(menuitem.action === "Antibodies"){
                       me.createWindow(menuitem.action,'EMS.view.Antibodies.Antibodies',{});
                   }
                   if(menuitem.action === "ExpType"){
                       me.createWindow(menuitem.action,'EMS.view.ExperimentType.ExperimentType',{});
                   }
                   if(menuitem.action === "CrossType"){
                       me.createWindow(menuitem.action,'EMS.view.Crosslink.Crosslink',{});
                   }
                   if(menuitem.action === "SeqCut"){
                       me.createWindow(menuitem.action,'EMS.view.SequenceCutter.MainWindow',{});
                   }
                   if(menuitem.action === "FragmentType"){
                       me.createWindow(menuitem.action,'EMS.view.Fragmentation.Fragmentation',{});
                   }
                   if(menuitem.action === "GenomeType"){
                       me.createWindow(menuitem.action,'EMS.view.Genome.Genome',{});
                   }
                   if(menuitem.action === "EGIDPatients"){
                       me.createWindow(menuitem.action,'EMS.view.Patients.MainWindow',{});
                   }
                   if(menuitem.action === "SuppInfo"){
                       me.createWindow(menuitem.action,'EMS.view.Info.Supplemental',{});
                   }
                   if(menuitem.action === "ProjectDesigner"){
                       me.createWindow(menuitem.action,'EMS.view.Project.Preliminary',{});
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
                                                      src: 'http://gbinternal/'
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
