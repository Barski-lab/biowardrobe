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

Ext.define('EMS.view.Project.Filter', {
    extend: 'Ext.window.Window',
    requires: ['Ext.form.Panel'],
    title: 'Filter settings',
    id: 'ProjectFilter',
    layout: 'fit',
    iconCls: 'default',
    maximizable: false,
    collapsible: false,
    constrain: true,
    minHeight: 350,
    minWidth: 300,
    height: 350,
    width: 600,
    initComponent: function () {
        var me = this;
        me.groups = [];
        me.filterc = 0;
        me.filters = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: [
                {"id": 1, "name": "equal"},
                {"id": 2, "name": "less than"},
                {"id": 3, "name": "greater than"},
                {"id": 4, "name": "less than or equal"},
                {"id": 5, "name": "greater than or equal"}
            ]
        });
        var fieldsdata = [
            {"id": 1, "name": "RPKM"},
            {"id": 2, "name": "Chromosome"}
        ];
        if (false) {
            fieldsdata = fieldsdata.concat([
                {"id": 3, "name": "Log Ratio"},
                {"id": 4, "name": "P-value"},
                {"id": 5, "name": "P-adjusted"}
            ]);
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
                            var name = Ext.getCmp('filter-name');
                            name.setDisabled(true);
                            var form = Ext.getCmp('ProjectFilterForm');

                            if (form.getForm().isValid()) {
                                var formData = me.getFormJson();
                                me.localSaveData(1, Ext.encode(formData));
                                Ext.Ajax.request({
                                    url: 'data/FilterSetAdd.php',
                                    method: 'POST',
                                    success: function (response) {
                                        me.close();
                                        if (typeof me.initialConfig.onSubmit !== 'undefined') {
                                            me.initialConfig.onSubmit();
                                        }
                                    },
                                    failure: function () {
                                        name.setDisabled(false);
                                    },
                                    jsonData: Ext.encode({
                                        "analysis_id": me.initialConfig.analysis_id,
                                        "ahead_id": me.initialConfig.ahead_id,
                                        filters: formData
                                    })
                                });
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
                fieldDefaults: {
                    labelWidth: 120,
                    labelAlign: 'top'
                },
                items: [
                    {
                        xtype: 'fieldset',
                        title: 'Add filter',
                        height: 70,
                        padding: 0,
                        margin: '5 5 5 5',
                        layout: {
                            type: 'hbox'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                margin: '0 5 0 5',
                                id: 'filter-name',
                                fieldLabel: 'Filter name will appear on a plot',
                                afterLabelTextTpl: required,
                                submitValue: false,
                                allowBlank: false,
                                labelAlign: 'top',
                                maxLength: 50,
                                maxLengthText: 'Maximum length of this field is 50 chars',
                                enforceMaxLength: true,
                                flex: 1,
                                labelWidth: 120,
                                enableKeyEvents: true,
                                listeners: {
                                    specialkey: function (field, event) {
                                        if (event.getKey() === event.ENTER) {
                                            var button = Ext.getCmp('filter-add');
                                            button.handler();
                                        }
                                    }
                                }

                            } ,
                            {
                                xtype: 'button',
                                margin: '18 5 0 5',
                                width: 100,
                                text: 'add',
                                id: 'filter-add',
                                submitValue: false,
                                iconCls: '',
                                handler: function () {
                                    var form = Ext.getCmp('ProjectFilterForm');
                                    if (form.getForm().isValid()) {
                                        var name = Ext.getCmp('filter-name');
                                        form.add(me.addFilter(name.getValue()));
                                        name.setValue('');
                                        form.getForm().clearInvalid();
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ];


        this.on('afterrender', function () {
            Ext.Ajax.request({
                url: 'data/FilterSet.php',
                method: 'POST',
                params: {
                    ahead_id: me.initialConfig.ahead_id
                },
                success: function (response) {
                    var data = Ext.decode(response.responseText);
                    if (data.success) {
                        //console.log('succ');
                        me.setFormJson(data.data);
                        me.localSaveData(1, Ext.encode(data.data));
                    } else {
                        //console.log('fail');
                        me.localLoadData(1, {
                            callback: function (records, operation, success) {
                                if (success) {
                                    me.setFormJson(Ext.decode(records[0].data.data));
                                }
                            }});
                    }

                },
                callback: function () {
                }
            });
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
        var combo = Ext.getCmp('filter_fieldset_' + filterc).getComponent(1).getComponent(0);
        combo.setValue(1);
        combo.setReadOnly(true);
    },

    /******************************************************************
     ******************************************************************/
    chrSelected: function (val, filterc, subfilter) {
        var form = Ext.getCmp('ProjectFilterForm').getForm();
        var cond = form.findField(filterc + '_' + subfilter + '_condition');
        var t_v = form.findField(filterc + '_' + subfilter + '_t_value');
        var n_v = form.findField(filterc + '_' + subfilter + '_n_value');
        if (val === 2) {
            cond.setValue(1);
            cond.setReadOnly(true);
            t_v.setVisible(true);
            t_v.setDisabled(false);
            n_v.setVisible(false);
            n_v.setDisabled(true);
        } else {
            cond.setReadOnly(false);
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
        var filter = Ext.create('Ext.form.FieldSet', {
            xtype: 'fieldset',
            title: 'Filter: ' + name,
            margin: '5 5 5 5',
            subfilter: 1,
            subfilterc: 0,
            filterc: me.filterc,
            flex: 2,
            id: 'filter_fieldset_' + me.filterc,
            layout: { type: 'fit' },
            items: [
                {
                    xtype: 'hidden',
                    name: 'filtername_' + me.filterc,
                    value: name
                }
            ]
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
        var subf = {
            xtype: 'fieldcontainer',
            id: 'filter_container_' + filterc + '_' + subfilter,
            subfilter: subfilter,
            defaults: { labelWidth: 120, labelAlign: 'top' },
            //flex:1,
            padding: '5',
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
                    value: parseInt(me.checkVal(params, 'operand', 1)),
                    store: me.operand,
                    flex: 1,
                    width: 55,
                    editable: false,
                    margin: '0 0 0 6'
                } ,
                {
                    xtype: 'combobox',
                    name: filterc + '_' + subfilter + '_tbl',
                    displayField: 'name',
                    valueField: 'id',
                    value: 1,
                    //store: me.tables,
                    flex: 3,
                    editable: false,
                    hidden: true,
                    margin: '0 0 0 6',
                    listeners: {
                        'select': function (sender, values) {
                        }
                    }

                } ,
                {
                    xtype: 'combobox',
                    name: filterc + '_' + subfilter + '_field',
                    displayField: 'name',
                    valueField: 'id',
                    value: parseInt(me.checkVal(params, 'field', 1)),
                    store: me.fields,
                    flex: 3,
                    editable: false,
                    margin: '0 0 0 6',
                    listeners: {
                        'select': function (sender, values) {
                            me.chrSelected(values[0].data.id, filterc, subfilter);
                        },
                        'render': function (sender) {
                            me.chrSelected(sender.getValue(), filterc, subfilter);
                        }
                    }

                } ,
                {
                    xtype: 'combobox',
                    name: filterc + '_' + subfilter + '_condition',
                    displayField: 'name',
                    valueField: 'id',
                    value: parseInt(me.checkVal(params, 'condition', 1)),
                    store: me.filters,
                    flex: 3,
                    editable: false,
                    margin: '0 0 0 6'

                } ,
                {
                    xtype: 'textfield',
                    name: filterc + '_' + subfilter + '_t_value',
                    flex: 2,
                    margins: '0 5 0 6',
                    width: 70,
                    hidden: true,
                    value: me.checkVal(params, 'value', ''),
                    allowBlank: false,
                    disabled: true
                } ,
                {
                    xtype: 'numberfield',
                    name: filterc + '_' + subfilter + '_n_value',
                    flex: 2,
                    margins: '0 5 0 6',
                    width: 70,
                    value: me.checkVal(params, 'value', 0.0),
                    step: 0.1,
                    allowBlank: false
                } ,
                {
                    xtype: 'button',
                    margin: '0 5 0 5',
                    submitValue: false,
                    iconCls: 'add',
                    handler: function () {
                        pf.add(me.addSubFilter(filterc, pf));
                    }
                } ,
                {
                    xtype: 'button',
                    margin: '0 5 0 5',
                    submitValue: false,
                    iconCls: 'delete',
                    handler: function () {
                        pf.subfilterc--;
                        if (pf.subfilterc === 0) {
                            var form = Ext.getCmp('ProjectFilterForm');
                            form.remove('filter_fieldset_' + filterc, true);
                        } else {
                            pf.remove('filter_container_' + filterc + '_' + subfilter, true);
                            me.firstOpReadOnly(filterc);
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
        var me = this, form = Ext.getCmp('ProjectFilterForm');
        for (var i = 0; i < data.length; i++) {
            var filter;
            for (var j = 0; j < data[i].conditions.length; j++) {
                if (j == 0) {
                    filter = me.addFilter(data[i].name, data[i].conditions[j]);
                    form.add(filter);
                } else {
                    me.addSubFilter(filter.filterc, filter, data[i].conditions[j]);
                }
            }
        }
        form.getForm().clearInvalid();
    },

    /******************************************************************
     ******************************************************************/
    getFormJson: function () {
        var form = Ext.getCmp('ProjectFilterForm');
        var formData = [];
        form.items.each(function (item) {
            if (item.getXType() === "fieldset" && item.title.indexOf("Filter") === 0) {
                var n = item.getComponent(0).getValue();
                var i = {name: n, conditions: [] };
                item.items.each(function (si) {
                    if (si.getXType() === 'fieldcontainer') {
                        var struct = {
                            operand: si.getComponent(0).getValue(),
                            table: si.getComponent(1).getValue(),
                            field: si.getComponent(2).getValue(),
                            condition: si.getComponent(3).getValue(),
                            value: si.getComponent(5).getValue()
                        };
                        if (struct.field === 2) {
                            struct.value = si.getComponent(4).getValue();
                        }
                        i.conditions.push(struct);
                    }
                });
                formData.push(i);
            }
        });
        return formData;
    },

    /******************************************************************
     ******************************************************************/
    localSaveData: function (id, json) {
        //var f = Ext.create('EMSLocalStorage',{ 'id': id, data: json });
        //f.save();
    },

    /******************************************************************
     ******************************************************************/
    localLoadData: function (id, params) {
        /*var store = Ext.create('Ext.data.Store', {
         model: 'EMSLocalStorage',
         filters: [ { property: 'id', value   : id }]
         });
         store.load(params);
         */
    }

});
