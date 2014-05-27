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

Ext.define('EMS.view.user.Preferences', {
    extend: 'Ext.window.Window',
    alias: 'widget.userpreferences',
    title: 'User settings',
    layout: 'fit',
    iconCls: 'user-information',
    height: 450,
    width: 600,
    requires: ['EMS.util.Util'],
    tools: [
        {
            type: 'help',
            tooltip: 'To change something do not forget to enter your old password at first'
        }
            ],
    items: [
        {
            xtype: 'form',
            border: false,
            frame: false,
            plain: true,
            //style: 'background-color: #fff;',
            fieldDefaults: {
                labelWidth: 120,
                labelAlign: 'top'
            },


            items: [
                {
                    xtype: 'fieldset',
                    title: 'Login Information',
                    defaultType: 'textfield',
                    layout: 'anchor',
                    margin: '5 5 5 5',
                    defaults: {
                        anchor: '100%'
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            defaultType: 'textfield',
                            items: [
                                {
                                    name: 'worker',
                                    fieldLabel: 'Login',
                                    flex: 2,
                                    afterLabelTextTpl: EMS.util.Util.required,
                                    emptyText: 'login',
                                    readOnly: true,
                                    allowBlank: false
                                },
                                {
                                    name: 'passwd',
                                    fieldLabel: 'Password',
                                    flex: 2,
                                    afterLabelTextTpl: EMS.util.Util.required,
                                    margins: '0 0 0 6',
                                    inputType: 'password'
                                }
                            ]
                        } ,
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Change password',
                            layout: 'hbox',
                            margin: '5 0 5 0',
                            defaultType: 'textfield',
                            items: [
                                {
                                    name: 'newpass',
                                    flex: 2,
                                    inputType: 'password',
                                    emptyText: 'password',
                                    vtype: 'customPass'
                                },
                                {
                                    name: 'newpassr',
                                    flex: 2,
                                    margins: '0 0 0 6',
                                    emptyText: 'retype password',
                                    inputType: 'password',
                                    vtype: 'customPass'

                                }
                            ]
                        }
                    ]
                } ,
                {
                    xtype: 'fieldset',
                    title: 'Personal Information',
                    defaultType: 'textfield',
                    margin: '5 5 5 5',
                    layout: 'anchor',
                    defaults: {
                        anchor: '100%'
                    },
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Name',
                            afterLabelTextTpl: EMS.util.Util.required,
                            layout: 'hbox',
                            combineErrors: true,
                            defaultType: 'textfield',
                            defaults: {
                                hideLabel: 'true'
                            },
                            items: [
                                {
                                    name: 'fname',
                                    flex: 3,
                                    emptyText: 'First Name',
                                    readOnly: true,
                                    allowBlank: false
                                },
                                {
                                    name: 'lname',
                                    flex: 3,
                                    margins: '0 0 0 6',
                                    emptyText: 'Last Name',
                                    readOnly: true,
                                    allowBlank: false
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            defaultType: 'textfield',
                            margin: '5 0 5 0',
                            items: [
                                {
                                    fieldLabel: 'Email Address',
                                    name: 'email',
                                    vtype: 'email',
                                    flex: 3
                                } ,
                                {
                                    xtype: 'checkbox',
                                    name: 'notify',
                                    boxLabel: 'Notify if experiment\'s status changed?',
                                    margin: '17 0 0 6',
                                    flex: 3
                                }
                            ]
                        }
                    ]
                } ,
                {
                    xtype: 'fieldset',
                    title: 'Core login info',
                    defaultType: 'textfield',
                    margin: '5 5 5 5',
                    layout: 'anchor',
                    defaults: {
                        anchor: '100%'
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            defaultType: 'textfield',
                            margin: '5 0 5 0',
                            items: [
                                {
                                    fieldLabel: 'Remote Login',
                                    name: 'dnalogin',
                                    flex: 4,
                                    emptyText: 'Login name to the core web site'
                                } ,
                                {
                                    name: 'dnapass',
                                    fieldLabel: 'Remote Password',
                                    inputType: 'password',
                                    flex: 4,
                                    margins: '0 0 0 6',
                                    emptyText: 'Corresponded password'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],

    buttons: [
        {
            text: 'Save',
            itemId: 'save'
        } ,
        {
            text: 'Cancel',
            itemId: 'cancel'
        }
    ]
});
