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


Ext.define('EMS.view.LabDataEdit.LabDataEdit', {
               extend: 'Ext.window.Window',
               alias : 'widget.LabDataEdit',

               title : 'Experiment basic data',
               layout: 'fit',
               iconCls: 'table2',
               buttonAlign: 'center',
               maximizable: true,

               plain: true,
               height: 700,
               width: 800,
               border: false,

               initComponent: function() {
                   var me=this;
                   var labDataForm = Ext.create('EMS.view.LabDataEdit.LabDataEditForm');

                   me.items= [
                            {
                                xtype: 'tabpanel',
                                frame: true,
                                border: false,
                                plain: true,
                                activeTab: 0,
                                items: [
                                    {
                                        xtype: 'panel',
                                        title: 'Change info',
                                        layout: 'fit',
                                        items: labDataForm
                                    },
                                    {
                                        xtype: 'panel',
                                        layout: 'fit',
                                        title: 'Processed data'
                                    }
                                ]
                            }
                        ];

                   me.buttons = [
                            {
                                text: 'Save',
                                action: 'save',
                                id: 'labdata-edit-save'
                            } , {
                                text: 'Cancel',
                                handler: function() {
                                    me.down('form').getForm().reset();
                                    me.close();
                                }
                            }
                        ];

                   me.callParent(arguments);
               }
           });

