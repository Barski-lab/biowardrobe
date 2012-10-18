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

Ext.define('EMS.view.Antibodies.Antibodies', {
               extend: 'Ext.Window',
               alias : 'widget.AntibodiesWindow',
               width: 350,
               height: 250,
               minWidth: 350,
               minHeight: 250,
               title: 'List of Antibodies',
               closable: true,
               maximizable: true,
               closeAction: 'hide',
               constrain: true,
               overflowY : 'scroll',
               iconCls: 'battery-green',

               layout: 'fit',


               initComponent: function() {
                   this.items = [
                            Ext.create('EMS.view.Antibodies.List')
                        ];
                   this.tbar = [
                            {
                                text:'New',
                                tooltip:'Add a new antibody',
                                action: 'Add',
                                iconCls:'table-row-add'
                            }, '-',
                            Ext.create('Ext.PagingToolbar', {
                                           store: {
                                               autoLoad: true,
                                               model: 'EMS.model.Antibodies',
                                               pageSize: 30,
                                               listeners: {
                                                   load: function() {
                                                       Logger.log('Antibodies store loaded');
                                                   }
                                               }
                                           }

                                       })
                        ];//tbar

                   this.callParent(arguments);
               }

           });
