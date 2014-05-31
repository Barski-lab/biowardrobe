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
Ext.define('EMS.view.user.Users', {
    extend: 'Ext.form.Panel',
    alias: 'widget.usersedit',

    requires: ['EMS.util.Util'],
    layout: {
        type: 'fit',
        //        align: 'stretch'
    },
    fieldDefaults: {
        labelWidth: 120,
        labelAlign: 'top'
    },
    items: [
        {
            xtype: 'fieldset',
            title: 'User information',
            padding: {top: 0, right: 1, left: 1, bottom: 0},
            margin: 0,
            collapsible: false,
            //            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'grid',
                    flex: 1,
                    margin: {top: 0, right: 5, left: 0, bottom: 0},
                    height: '100%',
                    store: 'Workers',
                    padding: 0,
                    columns: [
                        {header: 'Users', dataIndex: 'worker', flex: 1,
                            renderer: function (value, s, record) {
                                return Ext.String.format('<div class="userstopic"><b>{0}</b><span style="color: #333;">{1}</span></div>', value, record.get('fullname') || "Unknown");
                            }
                        },
                        {header: 'fulname', dataIndex: 'fullname', hidden: true, flex: 1},
                        {
                            xtype: 'actioncolumn',
                            width: 30,
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            items: [
                                {
                                    isDisabled: function (view, rowIndex, colIndex, item, record) {
                                        if (record.data.laboratory_id == "laborato-ry00-0000-0000-000000000001" && record.data.worker == "admin")
                                            return true;
                                        return false;
                                    },
                                    handler: function (view, rowIndex, colIndex, item, e) {
                                        this.fireEvent('itemclick', this, 'delete', view, rowIndex, colIndex, item, e);
                                    },
                                    iconCls: 'user-delete',
                                    tooltip: 'Delete'
                                }
                            ]
                        }

                    ]
                } , //grid
                {
                    xtype: 'panel',
                    flex: 1,
                    //maxHeight: '200',
                    //autoScroll: true,
                    overflowY: 'scroll',
                    //                    height: '100%',
                    margin: {top: 0, right: 0, left: 5, bottom: 0},
                    padding: 0,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            flex: 1,
                            defaultType: 'textfield',
                            margin: 0,
                            padding: 0,
                            items: [
                                {
                                    xtype: 'combobox',
                                    name: 'laboratory_id',
                                    //itemId: 'laboratory_id',
                                    displayField: 'name',
                                    fieldLabel: 'Laboratory',
                                    //store: 'Laboratories',
                                    queryMode: 'local',
                                    editable: false,
                                    allowBlank: false,
                                    valueField: 'id',
                                    afterLabelTextTpl: EMS.util.Util.required,
                                    flex: 1
                                } ,
                                {
                                    xtype: 'checkbox',
                                    name: 'admin',
                                    inputValue: 1,
                                    boxLabel: 'Laboratory admin?',
                                    margin: '17 0 0 6',
                                    flex: 1
                                }

                            ]
                        },


                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            flex: 1,
                            defaultType: 'textfield',
                            margin: 0,
                            padding: 0,
                            items: [
                                {
                                    name: 'worker',
                                    fieldLabel: 'Username',
                                    flex: 1,
                                    afterLabelTextTpl: EMS.util.Util.required,
                                    emptyText: 'Username',
                                    minLength: 3,
                                    vtype: 'alphanum',
                                    allowBlank: false
                                },
                                {
                                    name: 'passwd',
                                    fieldLabel: 'Password',
                                    minLength: 3,
                                    margins: '0 0 0 6',
                                    flex: 1,
                                    afterLabelTextTpl: EMS.util.Util.required,
                                    emptyText: 'Password',
                                    inputType: 'password'
                                }
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Name',
                            afterLabelTextTpl: EMS.util.Util.required,
                            layout: 'hbox',
                            flex: 1,
                            combineErrors: true,
                            defaults: {
                                xtype: 'textfield',
                                hideLabel: 'true'
                            },
                            margin: 0,
                            padding: 0,
                            items: [
                                {
                                    name: 'fname',
                                    flex: 1,
                                    emptyText: 'First Name',
                                    allowBlank: false
                                },
                                {
                                    name: 'lname',
                                    flex: 1,
                                    margins: '0 0 0 6',
                                    emptyText: 'Last Name',
                                    allowBlank: false
                                }
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            flex: 1,
                            defaultType: 'textfield',
                            margin: 0,
                            padding: 0,
                            items: [
                                {
                                    fieldLabel: 'Email Address',
                                    name: 'email',
                                    vtype: 'email',
                                    flex: 1
                                } ,
                                {
                                    xtype: 'checkbox',
                                    name: 'notify',
                                    boxLabel: 'Notify with changes.',
                                    inputValue: 1,
                                    margin: '17 0 0 6',
                                    flex: 1
                                }
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            flex: 1,
                            defaultType: 'textfield',
                            margin: 0,
                            padding: 0,
                            items: [
                                {
                                    name: 'dnalogin',
                                    fieldLabel: 'Remote login',
                                    flex: 1,
                                    emptyText: 'Remote login',
                                    minLength: 3,
                                    vtype: 'alphanum'
                                },
                                {
                                    name: 'dnapass',
                                    fieldLabel: 'Remote password',
                                    minLength: 3,
                                    margins: '0 0 0 6',
                                    flex: 1,
                                    emptyText: 'Remote password',
                                    inputType: 'password'
                                }
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            flex: 1,
                            defaultType: 'checkbox',
                            margin: 0,
                            padding: 0,
                            items: [
                                {
                                    name: 'changepass',
                                    boxLabel: 'Has to change password!',
                                    inputValue: 1,
                                    flex: 1
                                } ,
                                {
                                    name: 'relogin',
                                    boxLabel: 'Has to relogin!',
                                    margin: '0 0 0 6',
                                    inputValue: 1,
                                    flex: 1
                                }
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            flex: 1,
                            margin: 0,
                            padding: 0,
                            //                            hight: 10,
                            layout: {
                                type: 'hbox'
                            },
                            items: [
                                {
                                    xtype: 'button',
                                    text: 'Add',
                                    itemId: 'add',
                                    iconCls: 'user-add',
                                    margin: 8,
                                    flex: 1
                                },
                                {
                                    xtype: 'button',
                                    text: 'Change',
                                    itemId: 'change',
                                    iconCls: 'user-edit',
                                    margin: 8,
                                    flex: 1
                                }
                            ]
                        }
                    ]//
                }

            ]
        }
    ]
});
