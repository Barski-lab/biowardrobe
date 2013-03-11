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

Ext.define( 'EMS.model.AnalysisGroup', {
               extend: 'Ext.data.Model',
               fields: [
                   {name: 'project_id',     type: 'int'},
                   {name: 'item_id',     type: 'int'},
                   {name: 'status',     type: 'int'},
                   {name: 'item',     type: 'string'},
                   {name: 'leaf',     type: 'bool'},
                   {name: 'atype_id',     type: 'int'}
               ],
               proxy: {
                   type: 'memory',
//                   api: {
//                       destroy: ''
//                   },
//                   writer: {
//                       type: 'json',
//                       root: 'data',
//                       writeAllFields: true,
//                       encode: true
//                   }
               }

           });
