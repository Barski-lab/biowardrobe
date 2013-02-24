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

Ext.define('EMS.controller.Info', {
               extend: 'Ext.app.Controller',
               //stores: ['Worker'],
               //models: ['Worker'],
               views:  ['Info.Supplemental'],

               init: function() {
                   var me=this;
                   me.control({
                                  '#save-supplemental-info': {
                                      click: me.update
                                  }
                              });
               },

               //               edit: function() {
               //                   var edit = Ext.create('EMS.view.user.Edit',{newcomp: false,modal: true});
               //                   var form=edit.down('form');
               //                   form.getForm().findField('worker').setReadOnly(true);
               //                   var record = this.getWorkerStore().findRecord('id',USER_ID);
               //                   form.loadRecord(record);
               //                   edit.show();
               //                   return edit;
               //               },

               update: function(button) {
                   var win    = button.up('window');
                   var form   = win.down('form');
                   var record = form.getRecord();
                   var values = form.getValues();
                   win.close();

//                   if (form.getForm().isValid()) {
//                       record.set(values);
//                   } else {
//                       return;
//                   }

//                   this.getWorkerStore().on('datachanged',function(thestore,eopts) {
//                       Ext.Msg.show({
//                                        title: 'Password',
//                                        msg: 'Operation complete successfully',
//                                        icon: Ext.Msg.OK,
//                                        buttons: Ext.Msg.OK });
//                       win.close();
//                   },this,{ single: true });

//                   this.getWorkerStore().sync();
               }
           });
