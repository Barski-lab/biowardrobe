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

               models: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Fence','GenomeGroup'],
               stores: ['LabData','ExperimentType','Worker','Genome','Antibodies','Crosslinking','Fragmentation','Fence','GenomeGroup'],
               views:  ['EMS.view.ExperimentsWindow.Main','EMS.view.ExperimentsWindow.Grid','EMS.view.LabDataEdit.LabDataEditForm',
                   'EMS.view.LabDataEdit.LabDataEdit','EMS.view.charts.Fence','EMS.view.LabDataEdit.LabDataDescription','EMS.view.GenomeGroup.GenomeGroup',
                   'EMS.view.GenomeGroup.List'],

               refresh: false,

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
                                    },
                                    '#borwser-grp-edit': {
                                        click: this.onBrowserGroupEdit
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
                       var db=this.getGenomeStore().findRecord('id',combo.value).data.db;
                       this.genomeGroupStoreLoad(db);
                   }

               },
               onComboBoxSelectMakeFilter: function(combo, records, options) {
                   this.getLabDataStore().getProxy().setExtraParam('workerid',combo.value);
                   Ext.getCmp('ExperimentsWindowGrid').m_PagingToolbar.moveFirst()
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
               // Disabling/enabling antibody and fragmentation comboboxes
               //
               //-----------------------------------------------------------------------
               setDisabledByStatus: function(obj,sts) {
                   var form=obj.down('form').getForm();
                   if(sts >= 1) {
                       form.findField('libcode').setReadOnly(true);
                   }
                   if(sts >= 11) {
                       form.findField('experimenttype_id').setReadOnly(true);
                       form.findField('genome_id').setReadOnly(true);
                       form.findField('name4browser').setReadOnly(true);
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
               genomeGroupStoreLoad: function(db){
                   this.getGenomeGroupStore().getProxy().setExtraParam('genomedb',db);
                   if(Rights.check(USER_ID,'ExperimentsWindow')) {
                       this.getGenomeGroupStore().getProxy().setExtraParam('genomenm','');
                   } else {
                       this.getGenomeGroupStore().getProxy().setExtraParam('genomenm',USER_LNAME);
                   }
                   this.getGenomeGroupStore().load();
               },
               //-----------------------------------------------------------------------
               // Setting to read only all elements in form panel (except image upload why ?)
               // and disabling save button if current user and record owner are not the same
               //-----------------------------------------------------------------------
               onEditShow: function(obj) {
                   this.setVisibleSpike(obj);
                   this.setDisabledCombo(obj);

                   var form=obj.down('form').getForm();
                   var record = form.getRecord();
                   var panel=Ext.getCmp('labdataedit-main-tab-panel');

                   var db=this.getGenomeStore().findRecord('id',record.data['genome_id']).data.db;
                   this.genomeGroupStoreLoad(db);

                   if(parseInt(record.raw['worker_id']) !== parseInt(USER_ID) && !Rights.check(USER_ID,'ExperimentsWindow'))
                   {
                       form.getFields().each (function (field) {
                           field.setReadOnly (true);
                       });
                       Ext.getCmp('labdata-edit-save').disable();
                   }

                   var sts=parseInt(record.raw['libstatus']);
                   var base=sts/1000|0;
                   sts=sts%1000;


                   this.setDisabledByStatus(obj,sts);

                   if ( sts <= 11) {
                       form.findField('cells').focus(false,10);
                       for(var i=1; i< panel.items.length; i++) {
                           panel.items.getAt(i).setDisabled(true);
                       }
                       panel.setActiveTab(0);
                   } else if (sts > 11) {
                       this.getFenceStore().load({ params: { recordid: record.raw['id'] } });
                       panel.setActiveTab(1);

                       var etype=this.getExperimentTypeStore().findRecord('id',record.data['experimenttype_id']).data.etype;
                       var isRNA=(etype.indexOf('RNA') !== -1);

                       var panelD=Ext.getCmp('experiment-description');

                       panelD.tpl.overwrite(panelD.body,Ext.apply(record.data,{isRNA: isRNA}));


                       this.LabDataEdit.targetFrame.src='https://genomebrowser.research.cchmc.org/cgi-bin/hgTracks?db='+db+'&pix=1000&refGene=full&'+record.data['filename']+'=full';


                       if (record.data['tagsribo'] >0) {
                           var others=100.0-record.data['tagspercent']-record.data['tagsribopercent'];

                           var store = Ext.create('Ext.data.ArrayStore', {
                                                      fields: [
                                                          'name',
                                                          {name: 'percent', type: 'float'}
                                                      ],
                                                      data: [
                                                          ['Mapped',record.data['tagspercent']],
                                                          [isRNA?'Ribosomal':'Suppresed',record.data['tagsribopercent']],
                                                          ['Others',others.toFixed(2)]
                                                      ]
                                                  });

                           Ext.create('Ext.chart.Chart', {
                                          xtype: 'chart',
                                          animate: false,
                                          renderTo: 'exp-chart',
                                          height:110,
                                          width: 110,
                                          padding:0,
                                          margin:0,
                                          store: store,
                                          shadow: false,
                                          border: false,
                                          plain: true,
                                          layout: 'fit',
                                          insetPadding: 5,
                                          theme: 'Base:gradients',
                                          series: [{
                                                  type: 'pie',
                                                  field: 'percent',
                                                  tips: {
                                                      trackMouse: true,
                                                      width: 120,
                                                      height: 28,
                                                      font: '9px Arial',
                                                      renderer: function(storeItem, item) {
                                                          this.setTitle(storeItem.get('name') + ': ' + storeItem.get('percent')+'%');
                                                      }
                                                  },
                                                  label: {
                                                      field: 'percent',
                                                      display: 'rotate',
                                                      contrast: true,
                                                      font: '9px Arial'
                                                  }
                                              }]
                                      });

                       }//if ribosomal chart
                   }//sts>11

               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onEditClose: function(obj) {
                   if(this.refresh) {
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
                   Ext.getCmp('ExperimentsWindowGrid').m_PagingToolbar.moveFirst()
                   //this.getLabDataStore().load();
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
                   edit.labDataForm.loadRecord(r);
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
                   this.LabDataEdit = Ext.create('EMS.view.LabDataEdit.LabDataEdit',{addnew: false, modal:true });
                   this.LabDataEdit.down('form').loadRecord(record);
                   this.LabDataEdit.show();
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
                   form=form.getForm();

                   //var browsergrp=form.findField('browsergrp');

                   if(this.getGenomeGroupStore().findRecord('name',values['browsergrp']) === null) {
                       Ext.Msg.show({
                                        title: 'Save failed',
                                        msg: 'Field "Browser group name" should be saved separately<br> press button at the right to edit',
                                        icon: Ext.Msg.ERROR,
                                        buttons: Ext.Msg.OK
                                    });
                       return;
                   }

                   //                   if()
                   //                   {
                   //                       Logger.log('Dirty');
                   //                       Logger.log(browsergrp.getValue());
                   //                       Logger.log(browsergrp.getRawValue());
                   //                   }

                   //this.getGenomeGroupStore().sync();

                   if(win.addnew)
                   {
                       if(form.isValid())
                       {
                           EMS.store.LabData.insert(0, values);
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
                       if(form.isDirty()) {
                           record.set(values);
                           this.refresh=true;
                       }
                   }
                   if(this.refresh) {
                       this.getLabDataStore().sync();

                       //                       form.submit({
                       //                                       url: '/cgi-bin/barski/recordsTST.json',
                       //                                       waitMsg: 'Uploading file',
                       //                                       success: function(fp, o) {
                       //                                           Ext.Msg.alert('Success', o.result.file);
                       //                                       }
                       //                                   });
                   }
                   win.close();
               },
               onBrowserGroupEdit: function(button) {
                   var edit = Ext.create('EMS.view.GenomeGroup.GenomeGroup',{addnew: true,modal:true});
                   Logger.log(button);
                   edit.show();
               }


           });
