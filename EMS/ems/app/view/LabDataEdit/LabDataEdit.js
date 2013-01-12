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

Ext.define('EMS.view.LabDataEdit.LabDataEdit', {
               extend: 'Ext.window.Window',
               alias : 'widget.LabDataEdit',

               title : 'Laboratory Data Edit',
               layout: 'fit',
               buttonAlign: 'center',
               plain: true,
               height: 400,
               width: 600,

               initComponent: function() {
                   var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
                   this.items = [
                            {
                                xtype: 'form',
                                layout: 'form',
                                id: 'labdataId',
                                padding: '5 5 5 5',
                                bodyPadding: '5 5 5 5',
                                border: false,
                                frame: true,
                                fieldDefaults: {
                                    labelWidth: 120,
                                    msgTarget: 'side'
                                },
                                items: [
                                    {
                                        xtype: 'combobox',
                                        name : 'worker_id',
                                        hidden: false,
                                        displayField: 'fullname',
                                        fieldLabel: 'Belongs to',
                                        store: EMS.store.Worker,
                                        editable:false,
                                        valueField: 'id',
                                        anchor: '100%',
                                        disabled: USER_LNAME!=='porter'
                                    } , {
                                        xtype: 'textfield',
                                        name : 'cells',
                                        fieldLabel: 'Cells',
                                        anchor: '100%',
                                        afterLabelTextTpl: required,
                                        allowBlank: false
                                    } , {
                                        xtype: 'textfield',
                                        name : 'conditions',
                                        fieldLabel: 'Conditions',
                                        anchor: '100%',
                                        afterLabelTextTpl: required,
                                        allowBlank: false
                                    } , {
                                        xtype: 'textfield',
                                        anchor: '100%',
                                        name : 'name4browser',
                                        fieldLabel: 'Name for browser',
                                        afterLabelTextTpl: required,
                                        allowBlank: false
                                    } , {
                                        xtype: 'textfield',
                                        name : 'libcode',
                                        fieldLabel: 'Library Code',
                                        anchor: '100%',
                                        afterLabelTextTpl: required,
                                        allowBlank: false
                                    } , {
                                        layout: { type: 'hbox', pack: 'center' , align: 'middle' },
                                        height: 50,
                                        items: [
                                            {
                                                xtype: 'combobox',
                                                fieldLabel: 'Genome Type',
                                                name : 'genome_id',
                                                displayField: 'genome',
                                                store: EMS.store.Genome,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable: false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                width: '45%',
                                                labelWidth: 70,
                                                labelAlign: 'top'
                                            } , {
                                                xtype: 'tbspacer', width: '2%'
                                            } , {
                                                xtype: 'combobox',
                                                fieldLabel: 'Experiment Type',
                                                name : 'experimenttype_id',
                                                displayField: 'etype',
                                                store: EMS.store.ExperimentType,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable: false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                width: '45%',
                                                labelWidth: 70,
                                                labelAlign: 'top'
                                            }
                                        ]
                                    } , {
                                        layout: { type: 'hbox', pack: 'center' , align: 'middle' },
                                        height: 50,
                                        items: [
                                            {
                                                xtype: 'combobox',
                                                displayField: 'crosslink',
                                                name : 'crosslink_id',
                                                fieldLabel: 'Crosslink',
                                                store: EMS.store.Crosslinking,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable: false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                width: '45%',
                                                labelWidth: 70,
                                                labelAlign: 'top'
                                            } , {
                                                xtype: 'tbspacer', width: '2%'
                                            } , {
                                                xtype: 'combobox',
                                                fieldLabel: 'Fragmentation',
                                                name : 'fragmentation_id',
                                                displayField: 'fragmentation',
                                                store: EMS.store.Fragmentation,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable: false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                width: '45%',
                                                labelWidth: 70,
                                                labelAlign: 'top'
                                            }
                                        ]
                                    } , {
                                        layout: { type: 'hbox', pack: 'center' , align: 'middle' },
                                        height: 50,
                                        items: [
                                            {
                                                xtype: 'combobox',
                                                name : 'antibody_id',
                                                displayField: 'antibody',
                                                fieldLabel: 'Antibody',
                                                store: EMS.store.Antibodies,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable: false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                width: '45%',
                                                labelWidth: 70,
                                                labelAlign: 'top'
                                            } , {
                                                xtype: 'tbspacer', width: '2%'
                                            } , {
                                                xtype: 'numberfield',
                                                name : 'spikeins',
                                                fieldLabel: 'Spikeins',
                                                width: '45%',
                                                labelWidth: 70,
                                                labelAlign: 'top'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ];

                   this.buttons = [
                            {
                                text: 'Save',
                                action: 'save',
                                id: 'labdata-edit-save'
                            },
                            {
                                text: 'Cancel',
                                scope: this,
                                handler: function() {
                                    this.down('form').getForm().reset();
                                    this.close();
                                }
                            }
                        ];

                   this.callParent(arguments);
               }
           });

