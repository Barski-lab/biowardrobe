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

Ext.define('EMS.view.Project2.DESeqRun', {
    extend: 'Ext.window.Window',
    requires: ['Ext.form.Panel'],
    title: 'DESeq settings',
    id: 'Project2DESeqRun',
    layout: 'fit',
    iconCls: 'index-add',
    maximizable: false,
    collapsible: false,
    constrain: true,
    minHeight: 350,
    minWidth: 300,
    height: 450,
    width: 550,
    initComponent: function () {
        var me = this;
        me.groups = [];
        me.filterc = 0;

        var tablesN = [];
        var i = 0;

        for (i = 0; i < me.initialConfig.tables.getChildAt(0).childNodes.length; i++) {
            tablesN.push({
                id: me.initialConfig.tables.getChildAt(0).childNodes[i].data.id,
                name: me.initialConfig.tables.getChildAt(0).childNodes[i].data.name
            });
        }
        me.tables = Ext.create('Ext.data.Store', {
            fields: [ 'id', 'name'],
            data: tablesN
        });

        me.dockedItems = [
            {
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                layout: { pack: 'center' },
                items: [
                    {
                        xtype: 'button',
                        minWidth: 100,
                        minHeight: 30,
                        text: 'Run',
                        iconCls: 'media-play-green',
                        id: 'deseq-run',
                        handler: function () {
                            var form = Ext.getCmp('ProjectDESeqForm');
                            var name = Ext.getCmp('deseq-name');
                            for (i = 0; i < me.initialConfig.tables.getChildAt(1).childNodes.length; i++) {
                                if (name.getValue().trim().toUpperCase() === me.initialConfig.tables.getChildAt(1).childNodes[i].data.name.trim().toUpperCase()) {
                                    Ext.MessageBox.show({
                                        title: 'For you information',
                                        msg: 'DESeq name "' + name.getValue() + '" already exists please provide the other one.',
                                        icon: Ext.MessageBox.ERROR,
                                        fn: function () {
                                            name.focus(false, 200);
                                        },
                                        buttons: Ext.Msg.OK
                                    });
                                    return;
                                }
                            }
                            if (form.getForm().isValid()) {
                                var formData = me.getFormJson();
                                if (me.isTablesUniq(formData)) {
                                    LocalStorage.createData(LocalStorage.DESEQ_STORAGE, Ext.encode(formData));

                                    if (typeof me.initialConfig.onSubmit !== 'undefined') {
                                        me.initialConfig.onSubmit();
                                    }
                                } else {
                                    Ext.MessageBox.show({
                                        title: 'For you information',
                                        msg: 'You cant run DESeq on the same data.',
                                        icon: Ext.MessageBox.ERROR,
                                        fn: function () {
                                            name.focus(false, 200);
                                        },
                                        buttons: Ext.Msg.OK
                                    });
                                }
                            }
                        }
                    }
                ]
            }
        ];

        me.items = [
            {
                xtype: 'form',
                id: 'ProjectDESeqForm',
                border: false,
                frame: false,
                plain: true,
                autoScroll: true,
                items: [

                    {
                        xtype: 'panel',
                        margin: 5,
                        padding: 0,
                        draggable: false,
                        border: false,
                        frame: true,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        bodyStyle: 'background: #dfe9f6',
                        items: [
                            {
                                xtype: 'container',
                                flex: 1,
                                minHeight: 50,
                                layout: {
                                    type: 'hbox',
                                    align: 'stretch'
                                },
                                items: [
                                    {
                                        flex: 1,
                                        xtype: 'label',
                                        html: '<div class="panel-text">' + '<img src=images/about_big.png width=40 height=40 align=left>&nbsp;&nbsp;&nbsp;&nbsp;' + 'To run DESeq at first you have to type name which will be assigned to the result.' + ' Then choose which annotation grouping to apply (isoforms, genes, common tss).' + ' After that in "DESeq input" fieldset you should choose data to compare,' + ' it has to be at least two records, to add more press "+", to delete press "x".' + ' If you added more then two records time series will be made and index will be added to the name.' + '</div>'
                                    }
                                ]
                            }
                        ]




                    } ,
                    {
                        xtype: 'container',
                        padding: 0,
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                margin: '0 5 0 5',
                                id: 'deseq-name',
                                fieldLabel: 'Name for DESeq result',
                                afterLabelTextTpl: required,
                                submitValue: true,
                                allowBlank: false,
                                labelAlign: 'top',
                                maxLength: 50,
                                maxLengthText: 'Maximum length of this field is 50 chars',
                                enforceMaxLength: true,
                                flex: 2,
                                minWidth: 200,
                                anchor: "100%",
                                labelWidth: 300,
                                enableKeyEvents: true
                            },
                            {
                                xtype: 'combobox',
                                displayField: 'name',
                                valueField: 'id',
                                editable: false,
                                afterLabelTextTpl: required,
                                value: 1,
                                id: 'deseq-an-type',
                                fieldLabel: 'Series type',
                                labelAlign: 'top',
                                labelWidth: 300,
                                margin: '0 5 0 5',
                                allowBlank: false,
                                listeners: {
                                    'select': function (combo, records) {
                                    }
                                },
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['id', 'name'],
                                    data: [
                                        {"id": 1, "name": "Time series"},
                                        {"id": 2, "name": "Kinetics"},
                                        {"id": 3, "name": "Pairwise"}
                                    ]
                                }),
                                flex: 1
                            },
                            {
                                xtype: 'combobox',
                                displayField: 'name',
                                valueField: 'id',
                                editable: false,
                                afterLabelTextTpl: required,
                                value: LocalStorage.getParam(LocalStorage.PARAMS_STORAGE, 'default_annotation_grouping'),
                                id: 'deseq-rna-type',
                                fieldLabel: 'Annotation grouping',
                                labelAlign: 'top',
                                labelWidth: 300,
                                margin: '0 5 0 5',
                                allowBlank: false,
                                listeners: {
                                    'select': function (combo, records) {
                                        LocalStorage.setParam(LocalStorage.PARAMS_STORAGE, 'default_annotation_grouping', combo.getValue())
                                    }
                                },
                                store: Ext.create('Ext.data.Store', {
                                    fields: ['id', 'name'],
                                    data: [
                                        {"id": 1, "name": "RPKM isoforms"},
                                        {"id": 2, "name": "RPKM genes"},
                                        {"id": 3, "name": "RPKM common tss"}
                                    ]
                                }),
                                flex: 1 }
                        ]
                    }
                ]
            }
        ];


        this.on('afterrender', function () {
            var data = LocalStorage.findData(LocalStorage.DESEQ_STORAGE);
            if (data) {
                me.setFormJson(data);
            } else {
                var filter = me.addFilter();
                me.addSubFilter(filter);
                me.addSubFilter(filter);
                Ext.getCmp('ProjectDESeqForm').add(filter);
                me.firstOpReadOnly(filter);
                me.reApplyLabels();
            }
        }, {single: true});
        me.callParent(arguments);
    },

    /******************************************************************
     ******************************************************************/
    checkVal: function (obj, param, def) {
        if (typeof obj !== 'undefined' && typeof obj[param] !== 'undefined') {
            return obj[param];
        }

        return def;
    },

    /******************************************************************
     ******************************************************************/
    firstOpReadOnly: function (grp) {
        //var grp=Ext.getCmp('filter_fieldset_'+filterc);
        var num = grp.subfilterc;
        if (num <= 2) {
            grp.getComponent(0).getComponent(grp.getComponent(0).items.length - 1).setDisabled(true);
            grp.getComponent(1).getComponent(grp.getComponent(1).items.length - 1).setDisabled(true);
        } else {
            grp.getComponent(0).getComponent(grp.getComponent(0).items.length - 1).setDisabled(false);
            grp.getComponent(1).getComponent(grp.getComponent(1).items.length - 1).setDisabled(false);
        }
    },

    /******************************************************************
     ******************************************************************/
    reApplyLabels: function () {
        var form = Ext.getCmp('filter_fieldset_0');
        var i = 0;
        form.items.each(function (si) {
            if (si.getXType() === 'fieldcontainer') {
                i++;
                si.getComponent(0).setValue(i);
            }
        });

    },
    /******************************************************************
     ******************************************************************/
    addFilter: function (name, params) {
        var me = this;
        if (me.filterc > 0) return;
        //console.log('adding');
        var filter = Ext.create('Ext.form.FieldSet', {
            xtype: 'fieldset',
            title: ' DESeq input',
            margin: '5 5 5 5',
            subfilter: 0,
            subfilterc: 0,
            filterc: me.filterc,
            flex: 2,
            id: 'filter_fieldset_' + me.filterc,
            layout: { type: 'fit' },
        });
        me.filterc++;
        return filter;
    },

    /******************************************************************
     ******************************************************************/
    addSubFilter: function (pf, params) {
        var me = this;
        pf.subfilter++;
        pf.subfilterc++;
        var subfilter = pf.subfilter;
        var subf = {
            xtype: 'fieldcontainer',
            id: 'filter_container_' + pf.filterc + '_' + subfilter,
            subfilter: subfilter,
            padding: 4,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'order',
                    readOnly: true,
                    minWidth: 20,
                    maxWidth: 40,
                    width: 30,
                    border: false,
                    fieldCls: 'deseq-number',
                    margin: '0 5 0 0'
                } ,
                {
                    xtype: 'combobox',
                    name: pf.filterc + '_' + subfilter + '_tbl',
                    displayField: 'name',
                    store: me.tables,
                    valueField: 'id',
                    value: pf.subfilterc === 1 ? me.initialConfig.item_id : me.checkVal(params, 'table', me.initialConfig.item_id),
                    minWidth: 120,
                    flex: 3,
                    editable: false,
                    margin: '0 5 0 5'
                } ,
                {
                    xtype: 'button',
                    margin: '0 5 0 5',
                    submitValue: false,
                    iconCls: 'add',
                    handler: function () {
                        me.addSubFilter(pf);
                        me.firstOpReadOnly(pf);
                        me.reApplyLabels();
                    }
                } ,
                {
                    xtype: 'button',
                    margin: '0 0 0 5',
                    submitValue: false,
                    iconCls: 'delete',
                    handler: function () {
                        pf.subfilterc--;
                        if (pf.subfilterc === 1) {
                            pf.subfilterc = 2;
                        } else {
                            pf.remove('filter_container_' + pf.filterc + '_' + subfilter, true);
                            me.firstOpReadOnly(pf);
                            me.reApplyLabels();
                        }
                    }
                }
            ]
        };
        pf.add(subf);
    },

    /******************************************************************
     ******************************************************************/
    setFormJson: function (data) {
        var me = this, form = Ext.getCmp('ProjectDESeqForm'), filter;
        Ext.getCmp('deseq-name').setValue(data.name);
        if(typeof data.seriestype != 'undefined' )
            Ext.getCmp('deseq-an-type').setValue(data.seriestype);
        filter = me.addFilter(data.name, data.deseq[j]);
        form.add(filter);
        for (var j = 0; j < data.deseq.length; j++) {
            me.addSubFilter(filter, data.deseq[j]);
        }
        me.firstOpReadOnly(filter);
        me.reApplyLabels();
        form.getForm().clearInvalid();
    },

    /******************************************************************
     ******************************************************************/
    getFormJson: function () {
        var form = Ext.getCmp('filter_fieldset_0');
        var i = {
            name: Ext.getCmp('deseq-name').getValue().trim(),
            annottype: Ext.getCmp('deseq-rna-type').getValue(),
            seriestype: Ext.getCmp('deseq-an-type').getValue(),
            deseq: []
        };

        form.items.each(function (si) {
            if (si.getXType() === 'fieldcontainer') {
                var struct = {
                    order: parseInt(si.getComponent(0).getValue()),
                    table: si.getComponent(1).getValue(),
                };
                i.deseq.push(struct);
            }
        });
        return i;
    },

    /******************************************************************
     ******************************************************************/
    isTablesUniq: function (data) {
        var items = data.deseq;
        for (var i = 0; i < items.length - 1; i++) {
            for (var j = i + 1; j < items.length; j++) {
                if (items[i].table === items[j].table)
                    return false;
            }
        }
        return true;
    }

});
