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
               views:  ['user.Edit', 'user.List','WorkersEdit'],

               init: function() {
                   this.control({
                                    'WorkersEdit > grid': {
                                        itemdblclick: this.gridedit
                                    },
                                    '#worker-edit-save': {
                                        click: this.update
                                    },
                                    '#new-worker-window':{
                                        click: this.newworkerwin
                                    }
                                });
                   var me=this;
                   this.getWorkerStore().on('load',function() {
                       if(CHPASS == 1){
                           Ext.Msg.show({
                                            title: 'Change password',
                                            msg: 'Your password was not crypted please change it!',
                                            icon: Ext.Msg.WARNING,
                                            buttons: Ext.Msg.OK,
                                            fn:function(btn, text){
                                                //me.WorkerEditWindow=getController('WorkersEdit').edit();
                                                Ext.getCmp('EMSMenu').add(me.edit());
                                            }
                                        });
                       }
                   },this,{ single: true });

                   this.getWorkerStore().load();
               },

               gridedit: function(grid, record) {
                   var edit = Ext.create('EMS.view.user.Edit',{newcomp: false,modal: true});
                   edit.down('form').loadRecord(record);
                   edit.show();
               },

               edit: function() {
                   var edit = Ext.create('EMS.view.user.Edit',{newcomp: false,modal: true});
                   var form=edit.down('form');
                   form.getForm().findField('worker').setReadOnly(true);
                   var record = this.getWorkerStore().findRecord('id',USER_ID);
                   form.loadRecord(record);
                   edit.show();
                   return edit;
               },

               newworkerwin: function(button) {
                   var edit = Ext.create('EMS.view.user.Edit',{newcomp: true,modal: true});
                   edit.show();
               },
               update: function(button) {
                   var win    = button.up('window');
                   var form   = win.down('form');
                   var record = form.getRecord();
                   var values = form.getValues();

                   if(win.newcomp) {
                       if(values.Worker !== '' || values.fname !== '' || values.lname !== '') {
                           EMS.store.Worker.insert(0, values);
                       } else {
                           Ext.Msg.show({
                                            title: 'Save Failed',
                                            msg: 'Empty fields are not allowed',
                                            icon: Ext.Msg.ERROR,
                                            buttons: Ext.Msg.OK
                                        });
                           return;
                       }
                   } else {
                       if(values.passwd === '' && !Rights.check(USER_ID,'WorkerEdit')) {
                           Ext.Msg.show({
                                            title: 'Empty password',
                                            msg: 'Please fill password field',
                                            icon: Ext.Msg.ERROR,
                                            buttons: Ext.Msg.OK });
                           return;
                       }
                       if(values.newpass !== values.newpassr) {
                           Ext.Msg.show({
                                            title: 'Password not match',
                                            msg: 'New password does not match, please retype',
                                            icon: Ext.Msg.ERROR,
                                            buttons: Ext.Msg.OK });
                           return;
                       }
                       var Upper=0;
                       var Numbers=0;
                       var Symbols=0;
                       if(values.newpass !== '') {
                           for (i=0; i<values.newpass.length;i++) {
                               if (values.newpass[i].match(/[A-Z]/g)) {Upper++;}
                               if (values.newpass[i].match(/[0-9]/g)) {Numbers++;}
                               if (values.newpass[i].match(/(.*[!,@,#,$,%,^,&,*,?,_,~])/)) {Symbols++;}
                           }
                           if(Upper<2 || Numbers+Symbols < 2 || values.newpass.length === (Upper+Numbers+Symbols)) {
                               Ext.Msg.show({
                                                title: 'Password',
                                                msg: 'Password should contain different characters<br> at least 2 uppercase letters and numbers/symbols',
                                                icon: Ext.Msg.ERROR,
                                                buttons: Ext.Msg.OK });
                               return;
                           }
                       }
                       if(values.notify && values.email==='') {
                           Ext.Msg.show({
                                            title: 'Cant notify',
                                            msg: 'Cant notify without email',
                                            icon: Ext.Msg.ERROR,
                                            buttons: Ext.Msg.OK });
                           return;
                       }

                       if (form.getForm().isValid()) {
                           record.set(values);
                       } else {
                           return;
                       }
                   }

                   this.getWorkerStore().on('datachanged',function(thestore,eopts) {
                       Ext.Msg.show({
                                        title: 'Password',
                                        msg: 'Operation complete successfully',
                                        icon: Ext.Msg.OK,
                                        buttons: Ext.Msg.OK });
                       win.close();
                   },this,{ single: true });

                   this.getWorkerStore().sync();
               }
           });
