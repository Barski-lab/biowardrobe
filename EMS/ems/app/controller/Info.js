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
               stores: ['Info'],
               models: ['Info'],
               views:  ['Info.Supplemental'],

               init: function() {
                   var me=this;
                   me.control({
                                  '#save-supplemental-info': {
                                      click: me.update
                                  },
                                  '#InfoSupplemental': {
                                      render: me.onRender
                                  }

                              });
               },
               onRender: function(view) {
                   var me=this;
                   var store=me.getInfoStore();
                   store.getProxy().setExtraParam('id',1);
                   store.load();
                   store.on('load',function() {
                       view.down('form').loadRecord(store.getAt(0));
                   },this,{ single: true });
               },

               update: function(button) {
                   var me = this;
                   var win    = button.up('window');
                   var form   = win.down('form');
                   var record = form.getRecord();
                   var values = form.getValues();

                   if (form.getForm().isValid()) {
                       record.set(values);
                       var store = me.getInfoStore();
                       store.on('datachanged',function(thestore,eopts) {
                           win.close();
                       },this,{ single: true });
                       store.sync();
                   }
               }
           });
