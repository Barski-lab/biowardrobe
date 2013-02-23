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

Ext.define('EMS.controller.Patients', {
               extend: 'Ext.app.Controller',
               stores: ['Patients'],
               models: ['Patients'],
               views:  ['Patients.MainWindow'],

               init: function() {
                   var me=this;
//                   me.control({
//                                  '#run-sequence-cutter': {
//                                      click: this.run
//                                  }
//                              });
               },

               run: function(button) {
//                   button.setDisabled(true);
//                   var win    = button.up('window');
//                   var me=this;

//                   var len=parseInt(win.down('[name=length]').getValue());
//                   var sequence=win.down('[name=sequence]').getValue();

//                   sequence=sequence.replace(/\n/g, "");
//                   sequence=sequence.toUpperCase();
//                   if(sequence.length < len) {
//                       Ext.Msg.show({
//                                        title: 'For your information',
//                                        msg: 'Length of sequence can not be smaller then '+len,
//                                        icon: Ext.Msg.INFO,
//                                        buttons: Ext.Msg.OK
//                                    });
//                       return;
//                   }

//                   var stor=me.getPatientsStore();
//                   stor.getProxy().setExtraParam('sequence',sequence);
//                   stor.getProxy().setExtraParam('cutlen',len);
//                   stor.getProxy().setExtraParam('shift',win.down('[name=shift]').getValue());
//                   stor.getProxy().setExtraParam('findex',win.down('[name=findex]').getValue());
//                   stor.load();
//                   stor.on('load',function() {
//                       button.setDisabled(false);
//                   },this,{ single: true });
               }

           });
