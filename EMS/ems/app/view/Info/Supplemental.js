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

Ext.define('EMS.view.Info.Supplemental', {
               extend: 'Ext.window.Window',
               id : 'InfoSupplemental',
               requires: ['Ext.form.Panel'],
               title : 'Supplemental Materials',
               layout: 'fit',
               iconCls: 'notebook-edit',
               maximizable: true,
               collapsible: true,
               constrain: true,
               minHeight: 550,
               minWidth: 700,
               height: 550,
               width: 900,
               controllers: [
                   'EMS.controller.Info'
               ],
               initComponent: function() {
                   var me = this;
                   var closebutt={
                       minWidth: 90,
                       text: 'Close',
                       handler: function() { me.close(); }
                   };
                   var savebutt={
                       minWidth: 90,
                       text: 'Save',
                       id: 'save-supplemental-info'
                   };
                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: {
                                            pack: 'center'
                                        },
                                        items: []
                                    }];
                   me.items=[{
                                 xtype: 'form',
                                 layout: 'fit',
                                 frame: false,
                                 border: false,
                                 items: []
                             }];

                   if(Rights.check(USER_ID,'InfoSupplemental')) {
                       me.dockedItems[0].items=[savebutt,closebutt];
                       me.items[0].items=[{
                                              xtype: 'htmleditor',
                                              name: 'info',
                                              hideLabel: true
                                          }];
                   } else {
                       me.items[0].items=[{
                                              xtype: 'panel',
                                              //name: 'info',
                                              tpl: Ext.create('Ext.XTemplate','{info}'),
                                              //readonly: true,
                                              //hideLabel: true
                                          }];
                       me.dockedItems[0].items=[closebutt];
                   }

                   me.callParent(arguments);
               }
           });
