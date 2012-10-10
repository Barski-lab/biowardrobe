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
               alias : 'widget.andibodieslist',

               title : 'Antibodies list',
               store: {
                   autoLoad: true,
                   model: 'EMS.model.Antibodies',
                   listeners: {
                       load: function() {
                           Logger.log('Antibodies store loaded');
                       }
                   }
               },

               columns: [
                   Ext.create('Ext.grid.RowNumberer'),
                   {header: 'Antibodie', dataIndex: 'Antibodie', flex: 1}
               ]
           });
