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

Ext.define('EMS.view.user.Edit', {
    extend: 'Ext.window.Window',
    alias: 'widget.useredit',
    requires: ['Ext.form.Panel'],
    title: 'User settings',
    layout: 'fit',
    iconCls: 'user-information',
    height: 450,
    width: 600,

    initComponent: function () {
        var me = this;

        me.items = [
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
                                        afterLabelTextTpl: required,
                                        emptyText: 'login',
                                        allowBlank: false
                                    },
                                    {
                                        name: 'passwd',
                                        fieldLabel: 'Password',
                                        flex: 2,
                                        afterLabelTextTpl: required,
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
                                        emptyText: 'password'
                                    },
                                    {
                                        name: 'newpassr',
                                        flex: 2,
                                        margins: '0 0 0 6',
                                        emptyText: 'retype password',
                                        inputType: 'password'
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
                                afterLabelTextTpl: required,
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
                                        allowBlank: false
                                    },
                                    {
                                        name: 'lname',
                                        flex: 3,
                                        margins: '0 0 0 6',
                                        emptyText: 'Last Name',
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
                                        fieldLabel: 'Dna Login',
                                        name: 'dnalogin',
                                        flex: 4,
                                        emptyText: 'Dna Login'
                                    } ,
                                    {
                                        name: 'dnapass',
                                        fieldLabel: 'Dna Password',
                                        flex: 4,
                                        margins: '0 0 0 6',
                                        emptyText: 'Dna password'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        me.buttons = [
            {
                text: 'Save',
                //action: 'save',
                id: 'worker-edit-save'
            } ,
            {
                text: 'Cancel',
                handler: function () {
                    me.close();
                }
            }
        ];

        me.callParent(arguments);
    }
});
