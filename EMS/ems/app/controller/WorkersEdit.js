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

Ext.define('EMS.controller.WorkersEdit', {
               extend: 'Ext.app.Controller',
               stores: ['Worker'],
               models: ['Worker'],
               views: ['user.Edit', 'user.List','WorkersEdit'],

               init: function() {
                   this.control({
                                    //Double click event on a grid
                                    'WorkersEdit > grid': {
                                        itemdblclick: this.edit
                                    },
                                    //Button pressed save
                                    '#worker-edit-save': {
                                        click: this.update
                                    },
                                    '#new-worker-window':{
                                        click: this.newworkerwin
                                    }
                                });
                   this.getWorkerStore().load();
               },

               edit: function(grid, record) {
                   var edit = Ext.create('EMS.view.user.Edit',{newcomp: false,modal: true});//.show();
                   edit.down('form').loadRecord(record);
                   edit.show();
               },

               newworkerwin: function(button) {
                       var edit = Ext.create('EMS.view.user.Edit',{newcomp: true,modal: true});//.show();
                       edit.show();
               },
               update: function(button) {
                   var win    = button.up('window');
                   var form   = win.down('form');
                   var record = form.getRecord();
                   var values = form.getValues();

                   if(win.newcomp)
                   {
                       if(values.Worker !== '' || values.fname !== '' || values.lname !== '')
                       {
                           EMS.store.Worker.insert(0, values);
                       }
                       else
                       {
                           Ext.Msg.show({
                                            title: 'Save Failed',
                                            msg: 'Empty fields not allowed',
                                            icon: Ext.Msg.ERROR,
                                            buttons: Ext.Msg.OK
                                        });
                           return;
                       }
                   }
                   else
                   {
                       record.set(values);
                   }
                   win.close();
                   this.getWorkerStore().sync();
               }
           });
