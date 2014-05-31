/****************************************************************************
**
** Copyright (C) 2011-2014 Andrey Kartashov .
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

Ext.define('EMS.view.SequenceCutter.MainWindow', {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel',
                          'EMS.util.Util'],
               title : 'Sequence Cutter',
               layout: 'fit',
               iconCls: 'cut',
               closeAction: 'hide',
               maximizable: true,
//               collapsible: true,
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
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items:
                                    [{
                                        xtype: 'fieldset',
                                        title: 'Parameters',
                                        margin: '2 4 2 4',
                                        items: [{
                                                xtype: 'container',
                                                layout: 'hbox',
                                                items: [{
                                                        xtype: 'numberfield',
                                                        name: 'length',
                                                        fieldLabel: 'Length',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: EMS.util.Util.required,
                                                        emptyText: '12',
                                                        labelWidth: 120,
                                                        value: 12,
                                                        maxValue: 300,
                                                        minValue: 8,
                                                        margin: '0 0 0 5',
                                                        allowBlank: false
                                                    } , {
                                                        xtype: 'numberfield',
                                                        name: 'shift',
                                                        fieldLabel: 'Shift',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: EMS.util.Util.required,
                                                        emptyText: '1',
                                                        labelWidth: 120,
                                                        value: 1,
                                                        maxValue: 100,
                                                        minValue: 1,
                                                        margin: '0 5 0 5',
                                                        allowBlank: false
                                                    } ,{
                                                        xtype: 'combobox',
                                                        fieldLabel: 'Genome Type',
                                                        name : 'findex',
                                                        displayField: 'genome',
                                                        labelAlign: 'top',
                                                        afterLabelTextTpl: EMS.util.Util.required,
                                                        store: 'Genome',
                                                        typeAhead: false,
                                                        editable: false,
                                                        allowBlank: false,
                                                        valueField: 'findex',
                                                        value: 'hg19',
                                                        triggerAction: 'all',
                                                        queryMode: 'local',
                                                        margin: '0 5 0 5'
                                                    } , {

                                                        xtype: 'button',
                                                        text: 'Cut & Align',
                                                        id: 'run-sequence-cutter',
                                                        submitValue: false,
                                                        iconCls: 'cut',
                                                        minWidth: 100,
                                                        margin: '20 5 0 5'
                                                    }]
                                            }]
                                    } , {
                                        xtype: 'textarea',
                                        fieldLabel: 'Sequence without spaces',
                                        labelAlign: 'top',
                                        afterLabelTextTpl: EMS.util.Util.required,
                                        margin: '6 4 0 4',
                                        name: 'sequence',
                                        allowBlank: false,
                                        flex: 1
                                    } , {
                                        xtype: 'splitter'
                                    } , {
                                        xtype: 'grid',
                                        margin: '0 4 2 4',
                                        border: false,
                                        columnLines: true,
                                        store: 'SequenceCutter',
                                        viewConfig: {
                                            enableTextSelection: true
                                        },
                                        columns: [
                                            {xtype: 'rownumberer',width: 40},
                                            {header: 'Sequence', dataIndex: 'sequence', flex: 1 },
                                            {header: '# Aligment', dataIndex: 'align', width: 60, align: 'center' }
                                        ],
                                        name: 'result',
                                        flex: 2
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
