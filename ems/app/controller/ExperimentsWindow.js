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


Ext.define('EMS.controller.ExperimentsWindow', {
               extend: 'Ext.app.Controller',

               models: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Protocol'],
               stores: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Protocol'],
               views:  ['EMS.view.ExperimentsWindow.Main','EMS.view.ExperimentsWindow.Grid','EMS.view.LabDataEdit.LabDataEdit'],

               init: function()
               {
                   Logger.log('Experiments Control Loaded.');
                   this.control({
                                    'ExperimentsWindow': {
                                        render: this.onPanelRendered
                                    },
                                    'ExperimentsWindow grid': {
                                        selectionchange: this.onExperimentSelectionChanged,
                                        itemdblclick: this.onItemDblClick
                                    },
                                    'ExperimentsWindow button[action=Add]': {
                                        click: this.onAdd
                                    },
                                    'ExperimentsWindow button[action=Refresh]': {
                                        click: this.onRefresh
                                    },
                                    'LabDataEdit button[action=save]': {
                                        click: this.onSave
                                    }
                                });
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onPanelRendered: function() {
                   //Logger.log('The panel was rendered');
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------

               onAdd: function() {
                   Logger.log('Add pressed');
                   var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit').show();
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onRefresh: function() {
                   Logger.log('Refresh pressed');
                   this.getLabDataStore().load();
                   this.getLabDataStore().sync();
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onSave: function() {
                   Logger.log('Save pressed');
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onSelectionChanged: function() {
                   //Logger.log('onExperimentSelectionChanged');
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onItemDblClick: function(grid,record) {

                   Logger.log('onDblClicked grd:'+grid.self.getName()+' rec:'+record.self.getName());

                   var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit');
                   edit.show();
                   form=edit.down('form');
                   // edit.setTitle(edit.getTitle()+" Hi");
                   form.loadRecord(record);
                   console.log('record:');
                   console.log(record);
               }

           });
