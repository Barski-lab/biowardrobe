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

Ext.define('EMS.view.Project2.ATDPRun', {
    extend: 'Ext.window.Window',
    requires: ['Ext.form.Panel',
               "EMS.util.Util"],
    title: 'Average Tag Density settings',
    id: 'Project2ATDPRun',
    layout: 'fit',
    iconCls: 'chart-line',
    maximizable: false,
    collapsible: false,
    constrain: true,
    minHeight: 450,
    minWidth: 500,
    height: 550,
    width: 750,


    initComponent: function () {
        var me = this;

        me.groups = [];
        me.filterc = 0;

        var tablesD = [];
        for (var i = 0; i < me.initialConfig.tables.getChildAt(0).childNodes.length; i++) {
            tablesD.push({
                             id: me.initialConfig.tables.getChildAt(0).childNodes[i].data.id,
                             name: me.initialConfig.tables.getChildAt(0).childNodes[i].data.name
                         });
        }
        me.tablesD = Ext.create('Ext.data.Store', {
            fields: [ 'id', 'name'],
            data: tablesD
        });

        var tablesL = [];
        for (i = 0; i < me.initialConfig.tables.getChildAt(2).childNodes.length; i++) {
            tablesL.push({
                             id: me.initialConfig.tables.getChildAt(2).childNodes[i].data.id,
                             name: me.initialConfig.tables.getChildAt(2).childNodes[i].data.name
                         });
        }
        me.tablesL = Ext.create('Ext.data.Store', {
            fields: [ 'id', 'name'],
            data: tablesL
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
                        id: 'atdp-run',
                        handler: function () {
                            var form = Ext.getCmp('ProjectATDPForm');
                            var name = Ext.getCmp('atdp-name');
                            for (i = 0; i < me.initialConfig.tables.getChildAt(1).childNodes.length; i++) {
                                if (name.getValue().trim().toUpperCase() === me.initialConfig.tables.getChildAt(1).childNodes[i].data.name.trim().toUpperCase()) {
                                    Ext.MessageBox.show({
                                                            title: 'For you information',
                                                            msg: 'Average Tag Density name "' + name.getValue() + '" already exists please provide the other one.',
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
                                    //LocalStorage.createData(LocalStorage.ATDP_STORAGE, Ext.encode(formData));

                                    if (typeof me.initialConfig.onSubmit !== 'undefined') {
                                        me.initialConfig.onSubmit();
                                    }
                                } else {
                                    Ext.MessageBox.show({
                                                            title: 'For you information',
                                                            msg: 'You can\'t run ATDP on the same data.',
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
                id: 'ProjectATDPForm',
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
                                        html: '<div class="panel-text">'
                                                      + '<img src=images/about_big.png width=40 height=40 align=left>&nbsp;&nbsp;&nbsp;&nbsp;'
                                                      + 'To make an Average Tag Density Profile figure at first you have to type a name in the name field,'
                                                      + ' which will be assigned to the figure.'
                                                      + ' Then you can add as many plots as you need by pressing "+" button. For each plot you should assign name '
                                                      + ' which will appear later in the legend and make a pair from the "Genes Lists", that were created in corresponded analysis, '
                                                      + ' and current DNA seq list, by choosing them in comboboxes. It has to be at least one record. To add more press "+",'
                                                + ' to delete press "x".</div>'
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
                                id: 'atdp-name',
                                fieldLabel: 'Name for ATDP figure',
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
                            }
                        ]
                    }
                ]
            }
        ];

        this.on('afterrender', function () {
            var data;// = LocalStorage.findData(LocalStorage.ATDP_STORAGE);
            if (data) {
                me.setFormJson(data);
            } else {
                var filter = me.addFilter();
                me.addSubFilter(filter);
                Ext.getCmp('ProjectATDPForm').add(filter);
                me.firstOpReadOnly(filter);
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
        var grp = Ext.getCmp('filter_fieldset_0');
        if (grp.subfilterc <= 1) {
            grp.getComponent(0).getComponent(grp.getComponent(0).items.length - 1).setDisabled(true);
        } else {
            grp.getComponent(0).getComponent(grp.getComponent(0).items.length - 1).setDisabled(false);
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
            title: ' ATDP input',
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
                    name: pf.filterc + '_' + subfilter + '_pltname',
                    emptyText: 'Type name for the plot',
                    minWidth: 120,
                    maxWidth: 250,
                    width: 120,
                    flex: 2,
                    border: false,
                    submitValue: true,
                    allowBlank: false,
                    value: me.checkVal(params, 'pltname', ''),
                    margin: '0 5 0 0'
                } ,
                {
                    xtype: 'combobox',
                    name: pf.filterc + '_' + subfilter + '_tblD',
                    emptyText: 'Please choose DNA seq data',
                    displayField: 'name',
                    store: me.tablesD,
                    valueField: 'id',
                    value: undefined,//pf.subfilterc === 1 ? me.initialConfig.item_id : me.checkVal(params, 'table', me.initialConfig.item_id),
                    minWidth: 120,
                    flex: 3,
                    allowBlank: false,
                    editable: false,
                    margin: '0 5 0 5'
                } ,
                {
                    xtype: 'combobox',
                    name: pf.filterc + '_' + subfilter + '_tblL',
                    emptyText: 'Please choose Genes Lists',
                    displayField: 'name',
                    store: me.tablesL,
                    valueField: 'id',
                    value: undefined,// pf.subfilterc === 1 ? me.initialConfig.item_id : me.checkVal(params, 'table', me.initialConfig.item_id),
                    minWidth: 120,
                    flex: 3,
                    allowBlank: false,
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
                    }
                } ,
                {
                    xtype: 'button',
                    margin: '0 0 0 5',
                    submitValue: false,
                    iconCls: 'delete',
                    handler: function () {
                        pf.subfilterc--;
                        if (pf.subfilterc === 0) {
                            pf.subfilterc = 1;
                        } else {
                            pf.remove('filter_container_' + pf.filterc + '_' + subfilter, true);
                            me.firstOpReadOnly(pf);
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
        var me = this, form = Ext.getCmp('ProjectATDPForm'), filter;
        Ext.getCmp('atdp-name').setValue(data.name);
        filter = me.addFilter(data.name, data.atdp[0]);
        form.add(filter);
        for (var j = 0; j < data.atdp.length; j++) {
            me.addSubFilter(filter, data.atdp[j]);
        }
        me.firstOpReadOnly(filter);
        form.getForm().clearInvalid();
    },

    /******************************************************************
     ******************************************************************/
    getFormJson: function () {

        var form = Ext.getCmp('filter_fieldset_0');
        var i = {
            name: Ext.getCmp('atdp-name').getValue().trim(),
            atdp: []
        };

        form.items.each(function (si) {
            if (si.getXType() === 'fieldcontainer') {
                var struct = {
                    pltname: si.getComponent(0).getValue(),
                    tableD: si.getComponent(1).getValue(),
                    tableL: si.getComponent(2).getValue()
                };
                i.atdp.push(struct);
            }
        });
        return i;
    },

    /******************************************************************
     ******************************************************************/
    isTablesUniq: function (data) {
        var items = data.atdp;
        for (var i = 0; i < items.length - 1; i++) {
            for (var j = i + 1; j < items.length; j++) {
                if (items[i].tableD === items[j].tableD && items[i].tableL === items[j].tableL)
                    return false;
            }
        }
        return true;
    }

});
