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
               alias : 'widget.useredit',
               requires: ['Ext.form.Panel'],
               title : 'Edit User',
               layout: 'fit',

               height: 310,
               width: 290,

               initComponent: function() {
		   var me = this;
                   this.items = [
                            {
                                xtype: 'form',
                                padding: '5 5 0 5',
                                border: false,
                                style: 'background-color: #fff;',

                                items: [
                                    {
                                        xtype: 'textfield',
                                        name : 'worker',
                                        fieldLabel: 'Worker'
                                    },
                                    {
                                        xtype: 'textfield',
                                        name : 'fname',
                                        fieldLabel: 'First name'
                                    },
                                    {
                                        xtype: 'textfield',
                                        name : 'lname',
                                        fieldLabel: 'Last name'
                                    },
                                    {
                                        xtype: 'textfield',
                                        name : 'passwd',
                                        fieldLabel: 'Password',
                                        allowBlank: false,
                                        inputType: 'password'
                                    },
                                    {
                                        xtype: 'textfield',
                                        name : 'dnalogin',
                                        fieldLabel: 'Dna Login'
                                    }
                                    ,
                                    {
                                        xtype: 'textfield',
                                        name : 'dnapass',
                                        fieldLabel: 'Dna Pass'
                                    }
                                ]
                            }
                        ];

                   me.buttons = [
                            {
                                text: 'Save',
                                action: 'save',
                                id: 'worker-edit-save'
                            },
                            {
                                text: 'Cancel',
                                handler: function() { 
                            	    me.close(); 
                            	}
                            }
                        ];

                   me.callParent(arguments);
               }
           });
