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

Ext.define('EMS.view.Experiment.Experiment.EditForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.experimenteditform',

    //    bodyPadding: 5,
    //    border: false,
    //    frame: false,
    layout: 'fit',
    plain: true,
    trackResetOnLoad: true,
    fileUpload: true,
    fieldDefaults: {
        labelWidth: 120,
        labelAlign: 'top'
    },

    dockedItems: [
        {
            xtype: 'toolbar',
            dock: 'top',
            border: false,
            style: 'border-bottom: 2px solid #4c72a4;',
            //ui: 'footer',
            layout: {
                type: 'hbox',
                pack: 'start'
            },
            items: [
                {
                    xtype: 'displayfield',
                    fieldStyle: "color: #335; font: bold 13px arial, helvetica;",
                    name: 'author',
                    labelAlign: 'side',
                    labelWidth: 150,
                    labelStyle: "color: #335; font: bold 13px arial, helvetica;",
                    fieldLabel: 'Experiment added by:',
                    minWidth: 250,
                    margin: '5 5 10 5'
                }
            ]
        }
    ],
    items: [
        {
            xtype: 'tabpanel',
            border: false,
            padding: 0,
            margin: 0,
            layout: 'fit',
            //                margin: '5 5 5 0',
            activeTab: 0,

            items: [
                {
                    xtype: 'panel',
                    title: 'General info',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    frame: true,
                    border: false,
                    //plain: true,

                    items: [
                        {
                            xtype: 'fieldset',
                            title: 'Experiment description',
                            collapsible: true,
                            margin: '5 5 5 5',
                            defaults: { labelWidth: 120, labelAlign: 'top' },
                            items: [
                                {
                                    xtype: 'fieldcontainer',
                                    defaults: { labelWidth: 120, labelAlign: 'top' },
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            name: 'cells',
                                            fieldLabel: 'Cells',
                                            afterLabelTextTpl: EMS.util.Util.required,
                                            allowBlank: false,
                                            flex: 3
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'textfield',
                                            name: 'conditions',
                                            fieldLabel: 'Conditions',
                                            afterLabelTextTpl: EMS.util.Util.required,
                                            allowBlank: false,
                                            flex: 3
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'textfield',
                                            name: 'groupping',
                                            fieldLabel: 'Donor/Groupping',
                                            flex: 1
                                        }
                                    ]
                                } ,
                                {
                                    xtype: 'fieldcontainer',
                                    layout: 'hbox',
                                    defaults: { labelWidth: 120, labelAlign: 'top', margin: '10 0 0 0' },
                                    items: [
                                        {
                                            xtype: 'combobox',
                                            fieldLabel: 'Genome Type',
                                            name: 'genome_id',
                                            displayField: 'genome',
                                            store: 'Genome',
                                            typeAhead: false,
                                            editable: false,
                                            valueField: 'id',
                                            triggerAction: 'all',
                                            queryMode: 'local',
                                            flex: 1
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'combobox',
                                            fieldLabel: 'Experiment Type',
                                            name: 'experimenttype_id',
                                            displayField: 'etype',
                                            store: 'ExperimentType',
                                            typeAhead: false,
                                            editable: false,
                                            valueField: 'id',
                                            triggerAction: 'all',
                                            queryMode: 'local',
                                            flex: 1
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'combobox',
                                            fieldLabel: 'Fragmentation',
                                            name: 'fragmentation_id',
                                            displayField: 'fragmentation',
                                            store: 'Fragmentation',
                                            typeAhead: false,
                                            editable: false,
                                            valueField: 'id',
                                            triggerAction: 'all',
                                            queryMode: 'local',
                                            flex: 1
                                        }
                                    ]
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    defaults: {
                                        labelWidth: 120,
                                        labelAlign: 'top',
                                        margin: '10 0 0 0'
                                    },
                                    itemId: 'dnasupp',
                                    hidden: true,
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'combobox',
                                            displayField: 'crosslink',
                                            name: 'crosslink_id',
                                            fieldLabel: 'Crosslink',
                                            store: 'Crosslinking',
                                            typeAhead: false,
                                            editable: false,
                                            valueField: 'id',
                                            triggerAction: 'all',
                                            queryMode: 'local',
                                            flex: 1
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'combobox',
                                            name: 'antibody_id',
                                            displayField: 'antibody',
                                            fieldLabel: 'Antibody',
                                            store: 'Antibodies',
                                            typeAhead: false,
                                            editable: false,
                                            valueField: 'id',
                                            triggerAction: 'all',
                                            queryMode: 'local',
                                            flex: 1
                                        },
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'textfield',
                                            name: 'antibodycode',
                                            fieldLabel: 'Catalouge #',
                                            flex: 1
                                        }
                                    ]
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    layout: 'hbox',
                                    itemId: 'spikeinsupp',
                                    hidden: true,
                                    defaults: {
                                        labelWidth: 120,
                                        labelAlign: 'top',
                                        margin: '10 0 0 0'
                                    },
                                    items: [

                                        {
                                            xtype: 'textfield',
                                            name: 'spikeinspool',
                                            fieldLabel: 'Spikeins pool',
                                            flex: 1
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'combobox',
                                            displayField: 'spikeins',
                                            name: 'spikeins_id',
                                            fieldLabel: 'Spikeins',
                                            store: 'Spikeins',
                                            typeAhead: false,
                                            editable: false,
                                            valueField: 'id',
                                            triggerAction: 'all',
                                            queryMode: 'local',
                                            flex: 1
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'label',
                                            html: '',
                                            flex: 1
                                        }
                                    ]
                                } ,//spike

                                {
                                    xtype: 'fieldcontainer',
                                    defaults: {
                                        labelWidth: 120,
                                        labelAlign: 'top',
                                        margin: '10 0 0 0'
                                    },
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'datefield',
                                            name: 'dateadd',
                                            fieldLabel: 'Experiment date',
                                            afterLabelTextTpl: EMS.util.Util.required,
                                            allowBlank: false,
                                            flex: 1
                                        },
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'label',
                                            html: '',
                                            flex: 2
                                        }
                                    ]
                                }

                            ] // field set experiment description

                        } ,
                        {
                            xtype: 'fieldset',
                            title: 'Experiment arrangement',
                            margin: '25 5 5 5',
                            collapsible: true,
                            items: [
                                {
                                    xtype: 'fieldcontainer',
                                    defaults: {
                                        labelWidth: 120,
                                        labelAlign: 'top',
                                        margin: '5 0 0 0'
                                    },
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            name: 'name4browser',
                                            fieldLabel: 'Experiment\'s short name',
                                            emptyText: 'Experiment short name/UCSC genome browser track name',
                                            afterLabelTextTpl: EMS.util.Util.required,
                                            flex: 1,
                                            allowBlank: false
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'fieldcontainer',
                                            layout: 'hbox',
                                            flex: 1,
                                            items: [
                                                {
                                                    xtype: 'combobox',
                                                    name: 'egroup_id',
                                                    tpl: '<tpl for="."><div class="x-boundlist-item" ><b>{name}</b><div style="display: block; text-align: justify; line-height:100%; font-size:80%; color: #449;"> {description}</div></div></tpl>',
                                                    labelWidth: 110,
                                                    minWidth: 300,
                                                    displayField: 'name',
                                                    fieldLabel: 'Folders/Genome Browser folders',
                                                    valueField: 'id',
                                                    //store: 'EGroups',
                                                    triggerAction: 'all',
                                                    queryMode: 'local',
                                                    flex: 1,
                                                    forceSelection: true,
                                                    editable: false
                                                } /*,
                                                {
                                                    xtype: 'button',
                                                    text: '',
                                                    itemId: 'egrp-show',
                                                    submitValue: false,
                                                    iconCls: 'element-edit',
                                                    margin: '18 0 0 8'
                                                }*/
                                            ]
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'checkboxfield',
                                            name: 'browsershare',
                                            labelAlign: 'left',
                                            boxLabelAlign: 'before',
                                            inputValue: true,
                                            fieldLabel: 'Share data online?',
                                            margin: '21 0 0 8',
                                            flex: 1
                                        }
                                    ]
                                }
                            ] //genome browser
                        } ,
                        {
                            xtype: 'fieldset',
                            title: 'Experiment data downloading',
                            margin: '25 5 5 5',
                            collapsible: true,
                            items: [
                                {
                                    xtype: 'fieldcontainer',
                                    defaults: { labelWidth: 120, labelAlign: 'top' },
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            name: 'url',
                                            fieldLabel: 'Download URL',
                                            flex: 4,
                                            allowBlank: true
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'combobox',
                                            name: 'download_id',
                                            displayField: 'download',
                                            fieldLabel: 'Download type',
                                            store: 'Download',
                                            editable: false,
                                            valueField: 'id',
                                            triggerAction: 'all',
                                            queryMode: 'local',
                                            flex: 1
                                        }
                                    ]
                                }
                            ]
                        }//download
                    ]
                } ,
                {
                    title: 'Protocol',
                    itemId: 'protocol',
                    xtype: 'htmleditor',
                    name: 'protocol',
                    plugins: [new Ext.create('Ext.ux.form.HtmlEditor.imageUpload')],
                    hideLabel: true,
                    border: false,
                    frame: false,
                    padding: 0,
                    margin: 0
                } ,
                {
                    title: 'Notes',
                    itemId: 'notes',
                    xtype: 'htmleditor',
                    name: 'notes',
                    plugins: [new Ext.create('Ext.ux.form.HtmlEditor.imageUpload')],
                    frame: false,
                    border: false,
                    hideLabel: true,
                    padding: 0,
                    margin: 0
                },
                {
                    xtype: 'panel',
                    title: 'Advanced',
                    frame: true,
                    border: false,
                    plain: true,
                    items: [
                        {
                            xtype: 'fieldset',
                            title: 'Experiment additional info',
                            collapsible: true,
                            margin: '5 5 5 5',
                            defaults: { labelWidth: 220, labelAlign: 'top' },
                            items: [
                                {
                                    xtype: 'fieldcontainer',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'numberfield',
                                            name: 'fragmentsizeexp',
                                            fieldLabel: 'Expected Fragment Size',
                                            afterLabelTextTpl: EMS.util.Util.required,
                                            allowBlank: false,
                                            flex: 2,
                                            step: 1
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'checkboxfield',
                                            name: 'fragmentsizeforceuse',
                                            labelAlign: 'left',
                                            boxLabelAlign: 'before',
                                            inputValue: true,
                                            labelWidth: 180,
                                            fieldLabel: 'Force to use this fragment size?',
                                            margin: '18 0 0 10',
                                            flex: 2
                                        } ,
                                        {
                                            xtype: 'tbspacer',
                                            flex: 3
                                        }

                                    ]
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'numberfield',
                                            name: 'trim3',
                                            fieldLabel: 'Trim from the left',
                                            afterLabelTextTpl: EMS.util.Util.required,
                                            allowBlank: false,
                                            flex: 2,
                                            step: 1
                                        } ,
                                        {
                                            xtype: 'splitter'
                                        } ,
                                        {
                                            xtype: 'numberfield',
                                            name: 'trim5',
                                            fieldLabel: 'Trim from the right',
                                            afterLabelTextTpl: EMS.util.Util.required,
                                            allowBlank: false,
                                            flex: 2,
                                            step: 1
                                        },
                                        {
                                            xtype: 'tbspacer',
                                            flex: 3
                                        }

                                    ]
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'checkboxfield',
                                            name: 'forcerun',
                                            labelAlign: 'left',
                                            boxLabelAlign: 'before',
                                            inputValue: true,
                                            labelWidth: 200,
                                            fieldLabel: 'Force to repeat experiment analysis?',
                                            //margin: '18 0 0 10',
                                            flex: 1
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
    //        ;
    //        me.callParent(arguments);
    //    }

});


