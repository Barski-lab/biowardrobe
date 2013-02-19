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

Ext.define('EMS.store.LabData', {
               extend: 'Ext.data.Store',

               requires : [
                   'EMS.model.ExperimentType',
                   'EMS.model.Genome',
                   'EMS.model.Worker',
                   'EMS.model.Crosslinking',
                   'EMS.model.Fragmentation',
                   'EMS.model.Antibodies'
               ],

               storeId: 'LabData',
               model:  'EMS.model.LabData',
               autoLoad: false,
               singleton: true,
               remoteSort: true,
               remoteFilter: true,
               sorters: [{
                       property: 'dateadd',
                       direction: 'DESC'
                   },{
                       property: 'cells',
                       direction: 'ASC'
                   }],
               pageSize: 30,
               proxy: STORE_DEFS.proxy('labdata')
//               proxy: Ext.apply(STORE_DEFS.proxy('labdata'), {
//                                    api: {
//                                        read : '/cgi-bin/barski/records.json',
//                                        update: '/cgi-bin/barski/recordsUp1.json',
//                                        create: '/cgi-bin/barski/recordsNew1.json',
//                                        destroy: '/cgi-bin/barski/recordsDel1.json'
//                                    }
//                                })
           });

