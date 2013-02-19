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


Ext.define('EMS.view.Antibodies.List' ,{
               extend: 'Ext.grid.Panel',
               alias : 'widget.antibodieslist',
               //               frame: true,

               initComponent: function() {

                   var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                                                    clicksToEdit: 1
                                                });

                   Ext.apply(this, {
                                 store: EMS.store.Antibodies,

                                 columns: [
                                     Ext.create('Ext.grid.RowNumberer'),
                                     {header: 'Antibody', dataIndex: 'antibody', flex: 1, editor: { allowBlank: false} },
                                     {
                                         xtype: 'actioncolumn',
                                         width:35,
                                         sortable: false,
                                         items: [{
                                                 iconCls: 'table-row-delete',
                                                 tooltip: 'Delete Antibody',
                                                 handler: function(grid, rowIndex, colIndex) {
                                                     EMS.store.Antibodies.removeAt(rowIndex);
                                                 }
                                             }]
                                     }
                                 ],
                                 plugins: [cellEditing],
                                 tbar: [
                                     {
                                         text:'New',
                                         tooltip:'Add a new antibody',
                                         handler : function(){
                                             var r = Ext.create('EMS.model.Antibodies', {
                                                                    antibody: 'New Antibody'
                                                                });
                                             EMS.store.Antibodies.insert(0, r);
                                             cellEditing.startEditByPosition({row: 0, column: 1});
                                         },
                                         iconCls:'table-row-add'
                                     } , {
                                         text:'Save',
                                         tooltip:'Save changes',
                                         handler : function(){
                                             EMS.store.Antibodies.sync({
                                                                           success: function (batch, options) {
                                                                               console.log('Sync successed' ,batch, options);
                                                                               EMS.store.Antibodies.load();
                                                                           }});
                                         },
                                         iconCls:'table-ok'
                                     } , {
                                         text:'Reload',
                                         tooltip:'Reload',
                                         handler : function(){
                                             EMS.store.Antibodies.load();
                                         },
                                         iconCls:'table-refresh'
                                     }
                                 ]//tbar

                             });
                   this.callParent(arguments);
               }
           });
