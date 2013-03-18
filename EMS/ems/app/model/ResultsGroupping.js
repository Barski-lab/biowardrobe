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

Ext.define( 'EMS.model.ResultsGroupping', {
               extend: 'Ext.data.Model',
               fields: [
                   {name: 'project_id',     type: 'int'},
                   {name: 'item_id',     type: 'int'},
                   {name: 'item',     type: 'string'},
                   {name: 'leaf',     type: 'bool'},
                   {name: 'status',     type: 'int'},
                   {name: 'description',     type: 'string'},
                   {name: 'rtype_id',     type: 'int'},
                   {name: 'labdata_id',     type: 'int'}
               ],
               proxy: Ext.apply(STORE_DEFS.proxy('results',true), {
                             api: {
                                 read : 'data/ResultTree.php',
                                 update: 'data/ResultTreeUp.php',
                                 create: 'data/ResultTreeAdd.php',
                                 destroy: 'data/ResultTreeDel.php'
                             }
                         })
           });