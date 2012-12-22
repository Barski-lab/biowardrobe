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

Ext.define('EMS.controller.AntibodiesEdit', {
               extend: 'Ext.app.Controller',
               stores: ['Antibodies'],
               models: ['Antibodies'],
               views:  ['Antibodies.Antibodies','Antibodies.Edit', 'Antibodies.List'],
               refs: [
                   {
                       ref: 'AntibodieWindow',
                       selector: 'AntibodiesWindow'
                   }
               ],
               init: function() {
                   this.control({
                                    //Double click event on a grid
                                    'AntibodiesWindow grid': {
                                        itemdblclick: this.onItemDblClick
                                    },
                                    //Button pressed save
                                    'AntibodiesEdit button[action=save]': {
                                        click: this.onSave
                                    },
                                    'AntibodiesWindow button[action=Add]': {
                                        click: this.onAdd
                                    }
                                });
                   this.getAntibodiesStore().load();
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onAdd: function() {
                   var edit = Ext.create('EMS.view.Antibodies.Edit');//.show();
                   this.getAntibodieWindow().add(this.edit);
                   edit.show();
               },
               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onItemDblClick: function(grid, record) {
                   var edit = Ext.create('EMS.view.Antibodies.Edit');//.show();
                   this.getAntibodieWindow().add(this.edit);
                   edit.down('form').loadRecord(record);
                   edit.show();
               },

               //-----------------------------------------------------------------------
               //
               //
               //-----------------------------------------------------------------------
               onSave: function(button) {
                   var win    = button.up('window'),
                           form   = win.down('form'),
                           record = form.getRecord(),
                           values = form.getValues();

                   record.set(values);
                   win.close();
                   this.getAntibodiesStore().sync();
                   this.getAntibodiesStore().save();
                   Logger.log("Antibodies saved");
               }
           });
