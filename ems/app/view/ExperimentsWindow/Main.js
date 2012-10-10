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

Ext.define( 'EMS.view.ExperimentsWindow.Main' ,{
               extend: 'Ext.Window',
               alias : 'widget.ExperimentsWindow',
               title: 'Laboratory data',
               closable: true,
               maximizable: true,
               maximized: true,
               closeAction: 'hide',
               constrain: true,
               width: 1200,
               minWidth: 900,
               height: 500,
               iconCls: 'table2',
               layout: 'fit',

               initComponent: function() {
                   this.items = [
                            Ext.create('EMS.view.ExperimentsWindow.Grid')
                        ];
                   this.callParent(arguments);
               },

               tbar: [
                   {
                       text:'New',
                       tooltip:'Add a new experiment',
                       action: 'Add',
                       iconCls:'table-row-add'
                   }, '-',
                   {
                       text:'Refresh',
                       tooltip:'Refresh data',
                       action: 'Refresh',
                       iconCls:'table-refresh'
                   }
               ]//tbar
           });
