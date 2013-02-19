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

Ext.define('EMS.view.LabDataEdit.LabDataEditForm', {
               extend: 'Ext.form.Panel',

               bodyPadding: 5,
               border: false,
               frame: false,
               layout: 'border',
               plain: true,
               trackResetOnLoad : true,
               fileUpload:true,
               fieldDefaults: {
                   labelWidth: 120,
                   labelAlign: 'top'
               },

               initComponent: function() {
                   var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
                   var me=this;
                   me.items= [ {
                                  xtype: 'combobox',
                                  name : 'worker_id',
                                  displayField: 'fullname',
                                  fieldLabel: 'Belongs to',
                                  store: EMS.store.Worker,
                                  editable: false,
                                  valueField: 'id',
                                  region: 'north',
                                  margin: '5 5 5 5',
                                  readOnly: !Rights.check(USER_ID,'ExperimentsWindow'),
                                  readOnlyCls: ''
                              } , {
                                  xtype: 'tabpanel',
                                  frame: false,
                                  border: false,
                                  plain: true,
                                  region: 'center',
                                  margin: '5 5 5 0',
                                  activeTab: 0,
                                  items: [
                                      {
                                          xtype: 'panel',
                                          title: 'General info',
                                          layout: 'anchor',
                                          frame: true,
                                          border: false,
                                          plain: true,

                                          items: [
                                              {
                                                  xtype:'fieldset',
                                                  title: 'Experiment description',
                                                  collapsible: true,
                                                  margin: '5 5 5 5',
                                                  defaults: {
                                                      labelWidth: 120,
                                                      labelAlign: 'top'
                                                  },
                                                  items: [
                                                      {
                                                          xtype: 'fieldcontainer',
                                                          defaults: {
                                                              labelWidth: 120,
                                                              labelAlign: 'top'
                                                          },
                                                          layout: 'hbox',
                                                          items: [
                                                              {
                                                                  xtype: 'textfield',
                                                                  name : 'cells',
                                                                  fieldLabel: 'Cells',
                                                                  afterLabelTextTpl: required,
                                                                  allowBlank: false,
                                                                  flex: 1
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'textfield',
                                                                  name : 'conditions',
                                                                  fieldLabel: 'Conditions',
                                                                  afterLabelTextTpl: required,
                                                                  allowBlank: false,
                                                                  flex: 1
                                                              }
                                                          ]
                                                      } , {
                                                          xtype: 'fieldcontainer',
                                                          layout: 'hbox',
                                                          defaults: {
                                                              labelWidth: 120,
                                                              labelAlign: 'top',
                                                              margin: '10 0 0 0'
                                                          },
                                                          items: [
                                                              {
                                                                  xtype: 'combobox',
                                                                  fieldLabel: 'Genome Type',
                                                                  name : 'genome_id',
                                                                  displayField: 'genome',
                                                                  store: EMS.store.Genome,
                                                                  typeAhead: false,
                                                                  editable: false,
                                                                  valueField: 'id',
                                                                  triggerAction: 'all',
                                                                  queryMode: 'local',
                                                                  flex: 2
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'combobox',
                                                                  fieldLabel: 'Experiment Type',
                                                                  name : 'experimenttype_id',
                                                                  displayField: 'etype',
                                                                  store: EMS.store.ExperimentType,
                                                                  typeAhead: false,
                                                                  editable: false,
                                                                  valueField: 'id',
                                                                  triggerAction: 'all',
                                                                  queryMode: 'local',
                                                                  flex: 2
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'combobox',
                                                                  fieldLabel: 'Fragmentation',
                                                                  name : 'fragmentation_id',
                                                                  displayField: 'fragmentation',
                                                                  store: EMS.store.Fragmentation,
                                                                  typeAhead: false,
                                                                  editable: false,
                                                                  valueField: 'id',
                                                                  triggerAction: 'all',
                                                                  queryMode: 'local',
                                                                  flex: 2
                                                              }
                                                          ]
                                                      }, {
                                                          xtype: 'fieldcontainer',
                                                          id: 'rnafieldcontainer',
                                                          defaults: {
                                                              labelWidth: 120,
                                                              labelAlign: 'top',
                                                              margin: '10 0 0 0'
                                                          },
                                                          layout: 'hbox',
                                                          items: [
                                                              {
                                                                  xtype     : 'datefield',
                                                                  name      : 'dateadd',
                                                                  fieldLabel: 'Experiment date',
                                                                  afterLabelTextTpl: required,
                                                                  allowBlank: false,
                                                                  flex: 2
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'textfield',
                                                                  name : 'spikeinspool',
                                                                  fieldLabel: 'Spikeins pool',
                                                                  flex: 2
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'combobox',
                                                                  displayField: 'spikeins',
                                                                  name : 'spikeins_id',
                                                                  fieldLabel: 'Spikeins',
                                                                  store: EMS.store.Spikeins,
                                                                  typeAhead: false,
                                                                  editable: false,
                                                                  valueField: 'id',
                                                                  triggerAction: 'all',
                                                                  queryMode: 'local',
                                                                  flex: 2
                                                              }
                                                          ]
                                                      } , {
                                                          xtype: 'fieldcontainer',
                                                          defaults: {
                                                              labelWidth: 120,
                                                              labelAlign: 'top',
                                                              margin: '10 0 0 0'
                                                          },
                                                          layout: 'hbox',
                                                          items: [
                                                              {
                                                                  xtype: 'filefield',
                                                                  name: 'westernblot',
                                                                  id: 'westernblot',
                                                                  fieldLabel: 'Western blot',
                                                                  buttonText: '',
                                                                  emptyText: 'Select an image',
                                                                  disabled: true,
                                                                  buttonConfig: {
                                                                      iconCls: 'floppy-disk-add'
                                                                  },
                                                                  flex: 2
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'combobox',
                                                                  displayField: 'crosslink',
                                                                  name : 'crosslink_id',
                                                                  fieldLabel: 'Crosslink',
                                                                  store: EMS.store.Crosslinking,
                                                                  typeAhead: false,
                                                                  editable: false,
                                                                  valueField: 'id',
                                                                  triggerAction: 'all',
                                                                  queryMode: 'local',
                                                                  flex: 2
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'combobox',
                                                                  name : 'antibody_id',
                                                                  displayField: 'antibody',
                                                                  fieldLabel: 'Antibody',
                                                                  store: EMS.store.Antibodies,
                                                                  typeAhead: false,
                                                                  editable: false,
                                                                  valueField: 'id',
                                                                  triggerAction: 'all',
                                                                  queryMode: 'local',
                                                                  flex: 2
                                                              }
                                                          ]
                                                      }

                                                  ] // field set experiment description

                                              }, {
                                                  xtype:'fieldset',
                                                  title: 'Genome browser',
                                                  margin: '5 5 5 5',
                                                  collapsible: true,
                                                  items: [
                                                      {
                                                          xtype: 'fieldcontainer',
                                                          defaults: {
                                                              labelWidth: 120,
                                                              labelAlign: 'top'
                                                          },
                                                          layout: 'hbox',

                                                          items: [
                                                              {
                                                                  xtype: 'textfield',
                                                                  name : 'name4browser',
                                                                  fieldLabel: 'Name for browser',
                                                                  afterLabelTextTpl: required,
                                                                  flex: 3,
                                                                  allowBlank: false
                                                              } , {
                                                                  xtype: 'splitter'
                                                              } , {
                                                                  xtype: 'textfield',
                                                                  name : 'libcode',
                                                                  fieldLabel: 'Library Code',
                                                                  flex: 3,
                                                                  allowBlank: true
                                                              }
                                                          ]
                                                      } , {
                                                          xtype: 'fieldcontainer',
                                                          layout: 'hbox',

                                                          items: [

                                                              {
                                                                  xtype: 'fieldcontainer',
                                                                  layout: 'hbox',
                                                                  flex: 3,
                                                                  items: [
                                                                      {
                                                                          xtype: 'combobox',
                                                                          name : 'browsergrp',
                                                                          displayField: 'label',
                                                                          fieldLabel: 'Browser group name',
                                                                          store: EMS.store.GenomeGroup,
                                                                          typeAhead: true,
                                                                          editable: true,
                                                                          valueField: 'name',
                                                                          triggerAction: 'all',
                                                                          queryMode: 'local',
                                                                          flex: 4,
                                                                          afterLabelTextTpl: required,
                                                                          allowBlank: false,
                                                                          labelWidth: 120,
                                                                          labelAlign: 'top'
                                                                      } , {
                                                                          xtype: 'button',
                                                                          text: '',
                                                                          id: 'browser-grp-edit',
                                                                          submitValue: false,
                                                                          iconCls: 'element-edit',
                                                                          margin: '20 0 0 10'
                                                                      }
                                                                  ]},



                                                              {
                                                                  xtype: 'tbspacer',
                                                                  flex: 3
                                                              }

                                                          ]
                                                      }

                                                  ]
                                              }
                                          ]
                                      } , {
                                          xtype: 'panel',
                                          title: 'Protocol',
                                          frame: false,
                                          border: false,
                                          layout: 'fit',
                                          items: [
                                              {
                                                  xtype: 'htmleditor',
                                                  name: 'protocol',
                                                  hideLabel: true
                                              }
                                          ]
                                      } , {
                                          xtype: 'panel',
                                          title: 'Notes',
                                          layout: 'fit',
                                          frame: false,
                                          border: false,
                                          items: [
                                              {
                                                  xtype: 'htmleditor',
                                                  name: 'notes',
                                                  hideLabel: true
                                              }
                                          ]
                                      }
                                  ]
                              }];
                   me.callParent(arguments);
               }

           });


