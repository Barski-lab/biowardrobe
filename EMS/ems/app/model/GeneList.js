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

Ext.define('EMS.model.GeneList', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'leaf', type: 'bool'},
        {name: 'isnew', type: 'bool'},
        {name: 'item_id', type: 'string', persist: true},
        {name: 'gblink', type: 'string', persist: false},
        {name: 'conditions', type: 'string', persist: true},
        {name: 'tableName', type: 'string'},
        {name: 'type', type: 'int'},
        {name: 'rtype_id', type: 'int'},
        {name: 'atype_id', type: 'int'},
        {name: 'labdata_id', type: 'int'},
        {name: 'project_id', type: 'string'},
        {name: 'parent_id', type: 'string'},
        {name: 'status', type: 'int'}
    ],
    proxy: Ext.apply(STORE_DEFS.proxy('', true), {
        api: {
            read: 'data/GeneList.php',
            //create: 'data/GeneListAdd.php',
            update: 'data/GeneListUp.php',
            destroy: 'data/GeneListDel.php'
        }
    })
});
