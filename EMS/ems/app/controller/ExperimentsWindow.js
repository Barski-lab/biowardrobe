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

Ext.define('EMS.controller.ExperimentsWindow', {
               extend: 'Ext.app.Controller',

               models: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Fence'],
               stores: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Fence'],
               views:  ['EMS.view.ExperimentsWindow.Main','EMS.view.ExperimentsWindow.Grid','EMS.view.LabDataEdit.LabDataEditForm',
                   'EMS.view.LabDataEdit.LabDataEdit','EMS.view.charts.Fence','EMS.view.LabDataEdit.LabDataDescription'],

               refresh: false,
               comboselected: -1,

               init: function()
               {
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
                                        show: this.onEditShow,
                                        close: this.onEditClose
                                    },
                                    'LabDataEdit combobox': {
                                        select: this.onComboBoxSelect
                                    },
                                    '#labdata-grid-user-filter': {
                                        select: this.onComboBoxSelectMakeFilter
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
               onComboBoxSelectMakeFilter: function(combo, records, options) {
                   this.comboselected=combo.value;
                   this.getLabDataStore().getProxy().setExtraParam('workerid',combo.value);
                   this.getLabDataStore().load();
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
                       form.findField('spikeinspool').enable();
                   }
                   else {
                       form.findField('spikeins').disable();
                       form.findField('spikeinspool').disable();
                   }
               },

               onEditShow: function(obj) {
                   this.setVisibleSpike(obj);
                   this.setDisabledCombo(obj);

                   var form=obj.down('form').getForm();
                   var record = form.getRecord();
                   var panel=Ext.getCmp('labdataedit-main-tab-panel');

                   if(parseInt(record.raw['worker_id']) !== parseInt(USER_ID) && USER_LNAME!=='porter')
                   {
                       form.getFields().each (function (field) {
                           field.setReadOnly (true);
                       });
                       Ext.getCmp('labdata-edit-save').disable();
                   }

                   var sts=parseInt(record.raw['libstatus']);
                   var base=sts/1000|0;
                   sts=sts%1000;

                   if ( sts < 11) {
                       form.findField('cells').focus(false,10);
                       for(var i=1; i< panel.items.length; i++) {
                           panel.items.getAt(i).setDisabled(true);
                       }
                       panel.setActiveTab(0);
                   } else if (sts > 11) {
                       this.getFenceStore().load(
                                {
                                    params: {
                                        recordid: record.raw['id']
                                    }
                                });
                       panel.setActiveTab(1);

                       var panelD=Ext.getCmp('experiment-description');
                           panelD.tpl.overwrite(panelD.body, record.data);
                   }

               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onEditClose: function(obj) {
                   if(this.refresh) {
                       Logger.log('refreshed')
                       this.getLabDataStore().load();
                       this.refresh=false;
                   }
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
                   this.getLabDataStore().getProxy().setExtraParam('workerid',Ext.getCmp('labdata-grid-user-filter').getValue());
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
                                          libstatustxt: 'new',
                                          dateadd: new Date()
                                      });
                   edit.down('form').loadRecord(r);
                   var panel=Ext.getCmp('labdataedit-main-tab-panel');
                   for(var i=1; i< panel.items.length; i++) {
                       panel.items.getAt(i).setDisabled(true);
                   }
                   panel.setActiveTab(0);
                   edit.show();
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onItemDblClick: function(grid,record) {
                   var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit',{addnew: false, modal:true });
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
                           this.getLabDataStore().sync();
                           this.refresh=true;
                       }
                       else
                       {
                           Ext.Msg.show({
                                            title: 'Save failed',
                                            msg: 'Empty fields are not allowed',
                                            icon: Ext.Msg.ERROR,
                                            buttons: Ext.Msg.OK
                                        });
                           return;
                       }
                   }
                   else
                   {
                       if(form.getForm().isDirty()) {
                           record.set(values);
                           this.getLabDataStore().sync();
                           this.refresh=true;
                       }
                   }
                   win.close();
               }

           });
