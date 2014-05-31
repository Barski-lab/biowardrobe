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

Ext.define('EMS.view.Project2.Filter', {
    extend: 'Ext.window.Window',
    requires: ['Ext.form.Panel',
    'EMS.util.Util'],
    title: 'Filter settings',
    id: 'Project2Filter',
    layout: 'fit',
    iconCls: 'funnel-add',
    maximizable: false,
    collapsible: false,
    constrain: true,
    minHeight: 350,
    minWidth: 300,
    height: 400,
    width: 700,
    initComponent: function () {
        var me = this;
        me.groups = [];
        me.filterc = 0;
        me.filters = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {"id": 1, "name": "equal"},
                {"id": 2, "name": "not equal"},
                {"id": 3, "name": "less than"},
                {"id": 4, "name": "less than or equal"},
                {"id": 5, "name": "greater than"},
                {"id": 6, "name": "greater than or equal"}
            ]
        });
        me.filterschr = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {"id": 1, "name": "equal"},
                {"id": 2, "name": "not equal"}
            ]
        });
        var fieldsdata;
        me.deseq = false;
        if (typeof me.initialConfig.deseq !== 'undefined' && me.initialConfig.deseq) {
            me.deseq = true;
            fieldsdata = [
                {"id": 1, "name": "P-value"},
                {"id": 2, "name": "Log2 Ratio"},
                {"id": 3, "name": "P-adjasted"},
                {"id": 4, "name": "RPKM1"},
                {"id": 5, "name": "RPKM2"},
                {"id": 6, "name": "Chromosome"}
            ];
        } else {
            fieldsdata = [
                {"id": 1, "name": "RPKM"},
                {"id": 2, "name": "Chromosome"}
            ];
        }

        me.fields = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: fieldsdata
        });

        me.operand = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {"id": 1, "name": "AND"},
                {"id": 2, "name": "OR"}
            ]
        });
        var tablesN = [];
        var i = 0;
        if (!me.deseq) {
            for (i = 0; i < me.initialConfig.tables.getChildAt(0).childNodes.length; i++) {
                tablesN.push({
                                 id: me.initialConfig.tables.getChildAt(0).childNodes[i].data.id,
                                 name: me.initialConfig.tables.getChildAt(0).childNodes[i].data.name
                             });
            }
        } else {
            for (i = 0; i < me.initialConfig.tables.getChildAt(1).childNodes.length; i++) {
                if (me.initialConfig.tables.getChildAt(1).childNodes[i].data.rtype_id !== me.initialConfig.rtype_id)
                    continue;
                tablesN.push({
                                 id: me.initialConfig.tables.getChildAt(1).childNodes[i].data.id,
                                 name: me.initialConfig.tables.getChildAt(1).childNodes[i].data.name
                             });
            }
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
                        minWidth: 90,
                        text: 'Set',
                        handler: function () {
                            var form = Ext.getCmp('ProjectFilterForm');
                            var name = Ext.getCmp('filter-name');
                            var ind = 1;
                            if (me.deseq) ind = 2;
                            for (i = 0; i < me.initialConfig.tables.getChildAt(ind).childNodes.length; i++) {
                                if (name.getValue().trim().toUpperCase() === me.initialConfig.tables.getChildAt(ind).childNodes[i].data.name.trim().toUpperCase()) {
                                    Ext.MessageBox.show({
                                                            title: 'For you information',
                                                            msg: 'Filter name "' + name.getValue() + '" already exists please provide the other one.',
                                                            icon: Ext.MessageBox.ERROR,
                                                            fn: function () {
                                                                name.focus(false, 200);
                                                            },
                                                            buttons: Ext.Msg.OK
                                                        });
                                    return;
                                }
                            }
                            if (Ext.getCmp('filter_fieldset_0').openclose !== 0) {
                                Ext.MessageBox.show({
                                                        title: 'For you information',
                                                        msg: 'Number of opened and closed parantheses is not the same.<br> Plese fix.',
                                                        icon: Ext.MessageBox.ERROR,
                                                        buttons: Ext.Msg.OK
                                                    });
                                return;
                            }
                            if (form.getForm().isValid()) {
                                var formData = me.getFormJson();
                                //LocalStorage.createData(me.initialConfig.localid, Ext.encode(formData));

                                if (typeof me.initialConfig.onSubmit !== 'undefined') {
                                    me.initialConfig.onSubmit();
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
                id: 'ProjectFilterForm',
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
                                        html: '<div class="panel-text">' + '<img src=images/about_big.png width=40 height=40 align=left>&nbsp;&nbsp;&nbsp;&nbsp;' + 'To apply a filter at first you have to type filter name which will be assigned to the result.' + ' Then choose which annotation grouping to apply (isoforms, genes, common tss).' + ' After that in "Filter" fieldset you should choose data source and field which you want to filter,' + ' it has to be at least one record, to add more press "+", to delete press "x".' + ' ' + '</div>'
                                    }
                                ]
                            }
                        ]
                    } ,
                    {
                        xtype: 'container',
                        padding: 0,
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                margin: '0 5 0 5',
                                id: 'filter-name',
                                fieldLabel: 'Filter name, will be saved with this name',
                                afterLabelTextTpl: EMS.util.Util.required,
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
                            } ,
                            {
                                xtype: 'combobox',
                                displayField: 'name',
                                valueField: 'id',
                                editable: false,
                                value: me.deseq ? me.initialConfig.rtype_id : 2,//LocalStorage.getParam(LocalStorage.PARAMS_STORAGE, 'default_annotation_grouping'),
                                id: 'filter-rna-type',
                                afterLabelTextTpl: EMS.util.Util.required,
                                fieldLabel: 'Annotation grouping',
                                labelAlign: 'top',
                                labelWidth: 300,
                                margin: '0 5 0 5',
                                allowBlank: false,
                                disabled: me.deseq,
                                listeners: {
                                    'select': function (combo, records) {
                                        //LocalStorage.setParam(LocalStorage.PARAMS_STORAGE, 'default_annotation_grouping', combo.getValue());
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
                                flex: 1
                            } ,
                            {
                                xtype: 'checkboxfield',
                                boxLabel: 'Remove Non-coding RNA',
                                name: 'NR',
                                id: 'filter-noncoding-rna',
                                //inputValue: '1',
                                flex: 1,
                                checked: 1,//LocalStorage.getParam(LocalStorage.PARAMS_STORAGE, 'default_non_coding_rna'),
                                value: 1,//LocalStorage.getParam(LocalStorage.PARAMS_STORAGE, 'default_non_coding_rna'),
                                margin: '17 2 0 8',
                                listeners: {
                                    'change': function (check, newV, oldV) {
                                        //console.log(newV);
                                        //LocalStorage.setParam(LocalStorage.PARAMS_STORAGE, 'default_non_coding_rna', newV);
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ];


        this.on('afterrender', function () {
            var data; //= LocalStorage.findData(me.initialConfig.localid);
            if (data) {
                me.setFormJson(data);
            } else {
                Ext.getCmp('ProjectFilterForm').add(me.addFilter());
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
    firstOpReadOnly: function (filterc) {
        //                   var grp=Ext.getCmp('filter_fieldset_'+filterc);

        //                   var combo=grp.getComponent(0).getComponent(0);
        //                   combo.setValue(1);
        //                   combo.setReadOnly(true);
        //                   //var bt=Ext.getCmp('filter_fieldset_'+filterc).getComponent(0).getComponent(7);
        //                   //bt.setDisabled(true);


        //                   var num=grp.subfilterc;
        //                   console.log();
        //                   if(num<=1) {
        //                       grp.getComponent(0).getComponent(grp.getComponent(0).items.length-1).setDisabled(true);
        //                   }else{
        //                       grp.getComponent(0).getComponent(grp.getComponent(0).items.length-1).setDisabled(false);
        //                   }
    },
    braketFix: function () {
        var form = Ext.getCmp('filter_fieldset_0');
        var count=0;
        form.items.each(function (si) {
            if (si.getXType() === 'fieldcontainer') {
                if(si.getComponent(1).getText() == '(') {count++;
                    console.log("(",count);
                }
                if(si.getComponent(7).getText() == ')') {count--;
                    console.log(")",count);
                }
                }
        });
        form.openclose=count;
    },
    /******************************************************************
     ******************************************************************/
    chrSelected: function (val, filterc, subfilter, render) {
        var me = this;
        var form = Ext.getCmp('ProjectFilterForm').getForm();
        var cond = form.findField(filterc + '_' + subfilter + '_condition');
        var t_v = form.findField(filterc + '_' + subfilter + '_t_value');
        var n_v = form.findField(filterc + '_' + subfilter + '_n_value');
        var X = (typeof render !== 'undefined' && render);
        if ((val === 6 && me.deseq) || (val === 2 && !me.deseq)) {
            if (!X) {
                cond.bindStore(me.filterschr);
                cond.setValue(1);
            }
            t_v.setVisible(true);
            t_v.setDisabled(false);
            n_v.setVisible(false);
            n_v.setDisabled(true);
            t_v.setValue('chr1');
        } else {
            if (!X) {
                cond.bindStore(me.filters);
                //cond.setValue(1);
            }
            t_v.setVisible(false);
            t_v.setDisabled(true);
            n_v.setVisible(true);
            n_v.setDisabled(false);
        }
    },

    /******************************************************************
     ******************************************************************/
    addFilter: function (name, params) {
        var me = this;
        if (me.filterc > 0) return;
        //console.log('adding');
        var filter = Ext.create('Ext.form.FieldSet', {
            xtype: 'fieldset',
            title: 'Filter ',
            margin: '5 5 5 5',
            subfilter: 1,
            subfilterc: 0,
            openclose: 0,
            filterc: me.filterc,
            flex: 2,
            id: 'filter_fieldset_' + me.filterc,
            layout: { type: 'fit' }
        });
        me.addSubFilter(me.filterc, filter, params);
        me.firstOpReadOnly(me.filterc);
        me.filterc++;

        return filter;
    },

    /******************************************************************
     ******************************************************************/
    addSubFilter: function (filterc, pf, params) {
        var me = this;
        var subfilter = pf.subfilter;
        pf.subfilter++;
        pf.subfilterc++;
        if (me.checkVal(params, 'bracketl', '') === '(')
            pf.openclose++;
        if (me.checkVal(params, 'bracketr', '') === ')')
            pf.openclose--;
        var subf = {
                    xtype: 'fieldcontainer',
                    id: 'filter_container_' + filterc + '_' + subfilter,
                    subfilter: subfilter,
                    padding: 4,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'combobox',
                            name: filterc + '_' + subfilter + '_operand',
                            displayField: 'name',
                            valueField: 'id',
                            value: pf.subfilterc === 1 ? 1 : parseInt(me.checkVal(params, 'operand', 1)),
                            readOnly: pf.subfilterc === 1,
                            store: me.operand,
                            flex: 1,
                            width: 60,
                            editable: false,
                            margin: 0
                        } ,
                        {
                            xtype: 'button',
                            name: filterc + '_' + subfilter + '_bracketl',
                            margins: '0 0 0 6',
                            width: 20,
                            text: me.checkVal(params, 'bracketl', ''),
                            listeners: {
                                'click': function () {
                                    if (this.getText() === '') {
                                        pf.openclose++;
                                        this.setText('(');
                                    } else {
                                        if (pf.openclose > 0) {
                                            pf.openclose--;
                                            this.setText('');
                                        } else {
                                            Ext.MessageBox.show({
                                                                    title: 'For you information',
                                                                    msg: 'You have to remove right parentheses first.',
                                                                    icon: Ext.MessageBox.ERROR,
                                                                    buttons: Ext.Msg.OK
                                                                });
                                        }
                                    }
                                }
                            }
                        },
                        {
                            xtype: 'combobox',
                            name: filterc + '_' + subfilter + '_tbl',
                            displayField: 'name',
                            store: me.tables,
                            valueField: 'id',
                            value: me.initialConfig.item_id,
                            minWidth: 120,
                            flex: 3,
                            editable: false,
                            margin: '0 0 0 6'
                        },
                        {
                            xtype: 'combobox',
                            name: filterc + '_' + subfilter + '_field',
                            displayField: 'name',
                            valueField: 'id',
                            value: parseInt(me.checkVal(params, 'field', 1)),
                            store: me.fields,
                            flex: 2,
                            editable: false,
                            margin: '0 0 0 6',
                            listeners: {
                                'select': function (sender, values) {
                                    me.chrSelected(values[0].data.id, filterc, subfilter);
                                },
                                'render': function (sender) {
                                    me.chrSelected(sender.getValue(), filterc, subfilter, true);
                                }
                            }

                        },
                        {
                            xtype: 'combobox',
                            name: filterc + '_' + subfilter + '_condition',
                            displayField: 'name',
                            valueField: 'id',
                            value: parseInt(me.checkVal(params, 'condition', 1)),
                            store: (parseInt(me.checkVal(params, 'field', 1)) === 2 && !me.deseq) || (parseInt(me.checkVal(params, 'field', 1)) === 6 && me.deseq) ? me.filterschr : me.filters,
                            flex: 2,
                            editable: false,
                            margin: '0 0 0 6'

                        },
                        {
                            xtype: 'textfield',
                            name: filterc + '_' + subfilter + '_t_value',
                            flex: 1,
                            margins: '0 0 0 6',
                            width: 70,
                            hidden: true,
                            value: me.checkVal(params, 'value', ''),
                            allowBlank: false,
                            disabled: true
                        },
                        {
                            xtype: 'numberfield',
                            name: filterc + '_' + subfilter + '_n_value',
                            flex: 1,
                            margins: '0 0 0 6',
                            width: 70,
                            value: me.checkVal(params, 'value', 0.0),
                            step: 0.1,
                            allowBlank: false
                        },
                        {
                            xtype: 'button',
                            name: filterc + '_' + subfilter + '_bracketr',
                            margins: '0 5 0 6',
                            width: 20,
                            text: me.checkVal(params, 'bracketr', ''),
                            listeners: {
                                'click': function () {
                                    if (this.getText() === '') {
                                        if (pf.openclose > 0) {
                                            pf.openclose--;
                                            this.setText(')');
                                        } else {
                                            Ext.MessageBox.show({
                                                                    title: 'For you information',
                                                                    msg: 'You have to add left parentheses first.',
                                                                    icon: Ext.MessageBox.ERROR,
                                                                    buttons: Ext.Msg.OK
                                                                });
                                        }
                                    } else {
                                        pf.openclose++;
                                        this.setText('');
                                    }
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            margin: '0 5 0 5',
                            submitValue: false,
                            iconCls: 'add',
                            handler: function () {
                                pf.add(me.addSubFilter(filterc, pf));
                            }
                        },
                        {
                            xtype: 'button',
                            margin: '0 5 0 5',
                            submitValue: false,
                            disabled: pf.subfilterc === 1,
                            iconCls: 'delete',
                            handler: function () {
                                pf.subfilterc--;
                                if (pf.subfilterc === 0) {
                                    pf.subfilterc = 1;
                                } else {
                                    pf.remove('filter_container_' + filterc + '_' + subfilter, true);
                                    me.braketFix();
                                    me.firstOpReadOnly(filterc);
                                }
                            }
                        }
                    ]
                }
                ;
        pf.add(subf);
    },

    /******************************************************************
     ******************************************************************/
    setFormJson: function (data) {
        var me = this, form = Ext.getCmp('ProjectFilterForm'), i = 0;
        var filter;
        //Ext.getCmp('filter-name').setValue(data[i].name);
        for (var j = 0; j < data[i].conditions.length; j++) {
            if (j == 0) {
                filter = me.addFilter(data[i].name, data[i].conditions[j]);
                form.add(filter);
            } else {
                me.addSubFilter(filter.filterc, filter, data[i].conditions[j]);
            }
        }
        form.getForm().clearInvalid();
    },

    /******************************************************************
     ******************************************************************/
    getFormJson: function () {
        var me = this;
        var form = Ext.getCmp('filter_fieldset_0');
        var formData = [];
        var i = {
            name: Ext.getCmp('filter-name').getValue().trim(),
            annottype: Ext.getCmp('filter-rna-type').getValue(),
            nr: Ext.getCmp('filter-noncoding-rna').getValue(),
            conditions: []
        };
        form.items.each(function (si) {
            if (si.getXType() === 'fieldcontainer') {
                var c = 0;
                var struct = {
                    operand: si.getComponent(c++).getValue(),
                    bracketl: si.getComponent(c++).getText(),
                    table: si.getComponent(c++).getValue(),
                    field: si.getComponent(c++).getValue(),
                    condition: si.getComponent(c++).getValue(),
                    value: si.getComponent(c + 1).getValue(),
                    bracketr: si.getComponent(c + 2).getText()
                };
                if ((struct.field === 6 && me.deseq) || (struct.field === 2 && !me.deseq)) {
                    struct.value = si.getComponent(c).getValue();
                }
                i.conditions.push(struct);
            }
        });
        formData.push(i);
        return formData;
    }

})
;
