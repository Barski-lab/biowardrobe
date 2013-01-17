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

Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.ux.grid.FiltersFeature'
]);
//'Ext.toolbar.Paging',
//'Ext.ux.ajax.JsonSimlet',
//'Ext.ux.ajax.SimManager'


Ext.define('EMS.controller.ExperimentsWindow', {
               extend: 'Ext.app.Controller',

               models: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation'],
               stores: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation'],
               views:  ['EMS.view.ExperimentsWindow.Main','EMS.view.ExperimentsWindow.Grid','EMS.view.LabDataEdit.LabDataEditForm','EMS.view.LabDataEdit.LabDataEdit'],

               init: function()
               {
                   Logger.log('Experiments Control Loaded.');
                   this.control({
                                    'ExperimentsWindow': {
                                        show: this.onPanelRendered
                                    },
                                    'ExperimentsWindow grid': {
                                        selectionchange: this.onSelectionChanged,
                                        itemdblclick: this.onItemDblClick
                                    },
                                    '#new-experiment-data': {
                                        click: this.onAdd
                                    },
                                    '#labdata-edit-save': {
                                        click: this.onSave
                                    },
                                    'LabDataEdit': {
                                        show: this.onEditShow
                                    },
                                    'LabDataEdit combobox': {
                                        select: this.onComboBoxSelect
                                    }
                                });
               },
               //-----------------------------------------------------------------------
               // Disabling/enabling antibody and fragmentation in depend
               // of experiment type and genome on combobox select event
               //-----------------------------------------------------------------------
               onComboBoxSelect: function(combo, records, options) {
                   if(combo.name==='experimenttype_id') {
                       this.setDisabledCombo(combo.up('window'));
                   }
                   if(combo.name==='genome_id'){
                       this.setVisibleSpike(combo.up('window'));
                   }

               },

               //-----------------------------------------------------------------------
               // Disabling/enabling antibody and fragmentation comboboxes
               //
               //-----------------------------------------------------------------------
               setDisabledCombo: function(obj) {
                   var form=obj.down('form').getForm();
                   var combo = form.findField('experimenttype_id');

                   if( combo.getRawValue().indexOf('DNA') !== -1 ) {
                       form.findField('crosslink_id').enable();
                       form.findField('antibody_id').enable();
                   }
                   else {
                       form.findField('crosslink_id').disable();
                       form.findField('antibody_id').disable();
                   }
               },

               //-----------------------------------------------------------------------
               // Disabling/enabling spikeins field
               //
               //-----------------------------------------------------------------------
               setVisibleSpike: function(obj) {
                   var form = obj.down('form').getForm();
                   if( form.findField('genome_id').getRawValue().indexOf('spike') !== -1 ) {
                       form.findField('spikeins').enable();
                   }
                   else {
                       form.findField('spikeins').disable();
                   }
               },
               onEditShow: function(obj) {
                   this.setVisibleSpike(obj);
                   this.setDisabledCombo(obj);
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onSelectionChanged: function() {
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onPanelRendered: function() {
                   this.getLabDataStore().load();
               },

               //-----------------------------------------------------------------------
               //
               // Set default values when new button pressed
               //-----------------------------------------------------------------------
               onAdd: function() {
                   var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit',{addnew: true,modal:true});
                   var r = Ext.create('EMS.model.LabData', {
                                          worker_id: USER_ID,
                                          genome_id:  1,
                                          crosslink_id: 1,
                                          fragmentation_id: 1,
                                          antibody_id: 1,
                                          experimenttype_id: 1,
                                          libstatustxt: 'created',
                                          dateadd: new Date()
                                      });
                   edit.down('form').loadRecord(r);
                   edit.show();
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onItemDblClick: function(grid,record) {

                   Logger.log('onDblClicked grd:'+grid.self.getName()+' rec:'+record.self.getName());

                   var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit',{addnew: false,modal:true});
                   edit.down('form').loadRecord(record);
                   edit.show();
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onSave: function(button) {
                   var win    = button.up('window');
                   var form   = win.down('form');
                   var record = form.getRecord();
                   var values = form.getValues();

                   if(win.addnew)
                   {
                       if(form.getForm().isValid())
                       {
                           EMS.store.LabData.insert(0, values);
                       }
                       else
                       {
                           Ext.Msg.show({
                                            title: 'Save Failed',
                                            msg: 'Empty fields are not allowed',
                                            icon: Ext.Msg.ERROR,
                                            buttons: Ext.Msg.OK
                                        });
                           return;
                       }
                   }
                   else
                   {
                       record.set(values);
                   }
                   win.close();
                   this.getLabDataStore().sync();
               }

           });
