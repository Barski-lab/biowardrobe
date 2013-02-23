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

Ext.define('EMS.view.Patients.MainWindow', {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel'],
               title : 'Patients',
               layout: 'fit',
               iconCls: 'users3',
               closeAction: 'hide',
               maximizable: true,
               collapsible: true,
               constrain: true,
               minHeight: 550,
               minWidth: 700,
               height: 550,
               width: 700,

               initComponent: function() {
                   var me = this;

                   me.items =
                           [{
                                xtype: 'fieldcontainer',
                                //                                border: false,
                                //                                frame: true,
                                //                                plain: true,

                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items:
                                    [{
                                        xtype: 'fieldset',
                                        title: 'EGID',
                                        margin: '2 4 2 4',
                                        items: [{
                                                xtype: 'container',
                                                layout: 'hbox',
                                                items: [{
                                                        xtype: 'numberfield',
                                                        name: 'IDNO',
                                                        fieldLabel: 'IDNO',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: required,
                                                        emptyText: '(sequence #)',
                                                        labelWidth: 120,
                                                        //value: 1,
                                                        //maxValue: 300,
                                                        minValue: 1,
                                                        margin: '0 5 0 0',
                                                        allowBlank: false
                                                    } , {
                                                        xtype: 'numberfield',
                                                        name: 'EEFamID',
                                                        fieldLabel: 'EEFamID',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: required,
                                                        emptyText: '(family ID)',
                                                        labelWidth: 120,
                                                        //value: 1,
                                                        //maxValue: 100,
                                                        minValue: 1,
                                                        margin: '0 5 0 5',
                                                        allowBlank: false
                                                    } ,{
                                                        xtype: 'numberfield',
                                                        name: 'SubjectID',
                                                        fieldLabel: 'SubjectID',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: required,
                                                        emptyText: '(subject ID)',
                                                        labelWidth: 120,
                                                        //value: 1,
                                                        //maxValue: 100,
                                                        minValue: 1,
                                                        allowBlank: false,
                                                        margin: '0 5 0 5'
                                                    } /*, {

                                                        xtype: 'button',
                                                        text: 'Cut & Align',
                                                        id: 'run-sequence-cutter',
                                                        submitValue: false,
                                                        iconCls: 'cut',
                                                        minWidth: 100,
                                                        margin: '20 5 0 5'
                                                    }*/]
                                            }]
                                    } , {
                                        xtype: 'grid',
                                        margin: '0 4 6 4',
                                        border: false,
                                        columnLines: true,
                                        store: {
                                            fields: ['fname', 'lname', 'dob']
                                            //sorters: ['fname', 'lname']
                                        },
                                        viewConfig: {
                                            enableTextSelection: true
                                        },
                                        columns: [
                                            {xtype: 'rownumberer',width: 40},
                                            {header: 'First Name', dataIndex: 'fname', flex: 1 },
                                            {header: 'Last Name', dataIndex: 'lname', flex:1 },
                                            {header: 'Day of birth', dataIndex: 'dob', flex:1 }
                                        ],
                                        name: 'egid',
                                        flex: 1
                                    } , {
                                        xtype: 'fieldset',
                                        title: 'Samples',
                                        margin: '2 4 2 4',
                                        items: [{
                                                xtype: 'container',
                                                layout: 'hbox',
                                                items: [{
                                                        xtype: 'numberfield',
                                                        name: 'IDNO2',
                                                        fieldLabel: 'IDNO',
                                                        labelAlign: 'top',
                                                        //afterLabelTextTpl: required,
                                                        emptyText: '(sequence #)',
                                                        labelWidth: 120,
                                                        //value: 1,
                                                        //maxValue: 300,
                                                        minValue: 1,
                                                        margin: '0 5 0 0',
                                                        disabled: true,
                                                        allowBlank: false
                                                    } , {
                                                        xtype: 'numberfield',
                                                        name: 'SampleID',
                                                        fieldLabel: 'Sample ID',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: required,
                                                        emptyText: '(sample ID)',
                                                        labelWidth: 120,
                                                        //value: 1,
                                                        //maxValue: 100,
                                                        minValue: 1,
                                                        margin: '0 5 0 5',
                                                        allowBlank: false
                                                    } ,{
                                                        xtype: 'textfield',
                                                        name: 'SumpNum',
                                                        fieldLabel: 'Sample Number',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: required,
                                                        emptyText: '(sample number)',
                                                        labelWidth: 120,
                                                        //value: 1,
                                                        //maxValue: 100,
                                                        minValue: 1,
                                                        allowBlank: false,
                                                        margin: '0 5 0 5'
                                                    } /*, {

                                                        xtype: 'button',
                                                        text: 'Cut & Align',
                                                        id: 'run-sequence-cutter',
                                                        submitValue: false,
                                                        iconCls: 'cut',
                                                        minWidth: 100,
                                                        margin: '20 5 0 5'
                                                    }*/]
                                            }]
                                    } ,

                                    {
                                        xtype: 'grid',
                                        margin: '0 4 2 4',
                                        border: false,
                                        columnLines: true,
                                        store: {
                                            fields: ['sample']
                                        },
                                        viewConfig: {
                                            enableTextSelection: true
                                        },
                                        columns: [
                                            {xtype: 'rownumberer',width: 40},
                                            {header: 'Sample', dataIndex: 'sample', flex:1 }
                                        ],
                                        name: 'sample',
                                        flex: 1
                                    }
                                ]
                            }];



                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: {
                                            pack: 'center'
                                        },
                                        items: [{
                                                minWidth: 90,
                                                text: 'Close',
                                                handler: function() {
                                                    me.close();
                                                }
                                            }]
                                    }];
                   me.callParent(arguments);
               }
           });
