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

//Ext.require('EMS.store.ExperimentTypes');
//Ext.require('EMS.store.Workers');
//Ext.require('EMS.store.Genome');
//Ext.require('EMS.store.Protocol');
//Ext.require('EMS.store.Antibodies');
//Ext.require('EMS.store.Crosslinking');
//Ext.require('EMS.store.Fragmentation');

Ext.define('EMS.view.LabDataEdit.LabDataEdit', {
               extend: 'Ext.window.Window',
               alias : 'widget.LabDataEdit',

               requires: ['Ext.form.Panel'],
               stores: ['Genome','Protocol','ExperimentType'],
               title : 'Laboratory Data Edit',
               layout: 'fit',
               buttonAlign: 'center',
               //    autoShow: true,
               plain: true,
               height: 300,
               width: 450,

               initComponent: function() {
                   this.items = [
                            {
                                xtype: 'form',
                                padding: '5 5 0 5',
                                border: false,
                                frame: true,
                                fieldDefaults: { labelWidth: 120 },
                                items:
                                    [
                                    {
                                        xtype: 'textfield',
                                        name : 'Cells',
                                        fieldLabel: 'Cells',
                                        anchor: '100%',
                                        //                        flex: 1
                                    },
                                    {
                                        xtype: 'textfield',
                                        anchor: '100%',
                                        //                        flex: 1,
                                        name : 'Name4browser',
                                        fieldLabel: 'Name for browser'
                                    },
                                    {
                                        xtype: 'textfield',
                                        name : 'LibCode',
                                        fieldLabel: 'Library Code',
                                        anchor: '100%',
                                        //                        flex: 1
                                    },
                                    {
                                        layout: { type: 'hbox', pack: 'center', align: 'middle' },
                                        height: 50,
                                        items:[
                                            {
                                                xtype: 'combobox',
                                                name : 'protocol_id',
                                                displayField: 'protocol',
                                                fieldLabel: 'Protocol',
                                                store: EMS.store.Protocol,
                                                //                          hideTrigger: true,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable:false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                labelWidth: 70,
                                                width: 150
                                            },
                                            {
                                                xtype: 'tbspacer', width: 50
                                            },{
                                                xtype: 'combobox',
                                                name : 'experimenttype_id',
                                                //                          store: (new EMS.store.ExperimentTypes).load(),
                                                store: EMS.store.ExperimentType,
                                                displayField: 'Type',
                                                fieldLabel: 'Experiment Type',
                                                //                          hideTrigger: true,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable:false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                labelWidth: 100,
                                                width: 200
                                            }]
                                    },
                                    {
                                        layout: { type: 'hbox', pack: 'center', align: 'middle' },
                                        height: 50,
                                        items:[
                                            {
                                                xtype: 'numberfield',
                                                name : 'spikeins',
                                                fieldLabel: 'Spikeins',
                                                labelWidth: 70,
                                                width: 150
                                            },
                                            {
                                                xtype: 'tbspacer', width: 50
                                            },{
                                                xtype: 'combobox',
                                                name : 'genome_id',
                                                displayField: 'Genome',
                                                fieldLabel: 'Genome Type',
                                                store: EMS.store.Genome,
                                                mode: 'local',
                                                typeAhead: false,
                                                editable:false,
                                                valueField: 'id',
                                                triggerAction: 'all',
                                                queryMode: 'local',
                                                labelWidth: 100,
                                                width: 200
                                            }
                                        ]
                                    }
                                ]
                            }
                        ];

                   this.buttons = [
                            {
                                text: 'Save',
                                action: 'save'
                            },
                            {
                                text: 'Cancel',
                                scope: this,
                                handler: this.close
                            }
                        ];

                   this.callParent(arguments);
               }
           });

