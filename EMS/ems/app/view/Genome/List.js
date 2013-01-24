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


Ext.define('EMS.view.Genome.List' ,{
               extend: 'Ext.grid.Panel',

               initComponent: function() {

                   var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', { clicksToEdit: 1 } );

                   this.columns=[];
                   this.tbar=[];
                   this.columns.push(Ext.create('Ext.grid.RowNumberer'));
                   this.columns.push({header: 'Genome', dataIndex: 'genome', flex: 1, editor: { allowBlank: false} });
                   if(Rights.check(USER_ID,'Genome')) {
                       this.columns.push(
                                {
                                    xtype: 'actioncolumn',
                                    width:35,
                                    sortable: false,
                                    items: [{
                                            iconCls: 'table-row-delete',
                                            tooltip: 'Delete record',
                                            handler: function(grid, rowIndex, colIndex) { EMS.store.Genome.removeAt(rowIndex); }
                                        }]
                                }
                                );
                       this.plugins = [cellEditing];
                       this.tbar.push({
                                          text:'New',
                                          tooltip:'Add a new Genome type',
                                          handler : function(){
                                              var r = Ext.create('EMS.model.Genome', { genome: 'New Genome Type' } );
                                              EMS.store.Genome.insert(0, r);
                                              cellEditing.startEditByPosition({row: 0, column: 1});
                                          },
                                          iconCls:'table-row-add'
                                      });
                       this.tbar.push({
                                          text:'Save',
                                          tooltip:'Save changes',
                                          handler : function(){
                                              EMS.store.Genome.sync({ success: function (batch, options) { EMS.store.Genome.load(); } });
                                          },
                                          iconCls:'table2-check'
                                      });
                       this.tbar.push('-');
                   }
                   this.tbar.push(Ext.create('Ext.PagingToolbar', { store: EMS.store.Genome }) );

                   Ext.apply(this, { store: EMS.store.Genome });

                   this.callParent(arguments);
               }
           });
