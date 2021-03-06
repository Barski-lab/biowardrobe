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

Ext.define('EMS.store.ProjectLabData', {
    extend: 'Ext.data.Store',

    requires: [
        'EMS.model.ProjectLabData',
        'EMS.proxy.StandardProxyRemote',
        'EMS.model.ExperimentType',
        'EMS.model.Genome',
        'EMS.model.Worker',
        'EMS.model.Crosslinking',
        'EMS.model.Fragmentation',
        'EMS.model.Antibodies'
    ],

    storeId: 'ProjectLabData',
    model: 'EMS.model.ProjectLabData',
    autoLoad: false,
    singleton: true,
    remoteSort: true,
    remoteFilter: true,
    listeners: {
        load: function (store, records, successful, eOpts) {
        }
    },
    sorters: [
        {
            property: 'dateadd',
            direction: 'DESC'
        },
        {
            property: 'cells',
            direction: 'ASC'
        }
    ],
    pageSize: 15,
    proxy: {
        type: 'standardproxyremote',
        api: {
            read: 'data/ProjectLabData.php'
        }
    }

});

