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

Ext.define( 'EMS.model.LabData', {
               extend: 'Ext.data.Model',

               idProperty: 'id',

               requires : [
                   'EMS.model.ExperimentType',
                   'EMS.model.Genome',
                   'EMS.model.Worker',
                   'EMS.model.Crosslinking',
                   'EMS.model.Fragmentation',
                   'EMS.model.Antibodies'
               ],

               fields: [
                   { name: 'id', type: 'int' },
                   { name: 'cells', type: 'string' },
                   { name: 'conditions', type: 'string' },
                   { name: 'spikeinspool', type: 'string' },
                   { name: 'spikeins_id', type: 'int' },
                   { name: 'tagstotal', type: 'int', persist: false  },
                   { name: 'tagsmapped', type: 'int', persist: false  },
                   { name: 'tagsribo', type: 'int', persist: false  },
                   { name: 'fragmentsize', type: 'int', persist: false  },
                   { name: 'fragmentsizeexp', type: 'int'  },
                   { name: 'fragmentsizeest', type: 'int', persist: false  },
                   { name: 'fragmentsizeforceuse', type: 'bool' },
                   { name: 'notes', type: 'string' },
                   { name: 'protocol', type: 'string' },
                   { name: 'filename', type: 'string', persist: false  },
                   { name: 'libcode', type: 'string' },
                   { name: 'url', type: 'string' },
                   { name: 'name4browser', type: 'string' },
                   { name: 'browsergrp', type: 'string' },
                   { name: 'dateadd', type: 'date', dateFormat: 'm/d/Y'},
                   { name: 'libstatus', type: 'int', persist: false },
                   { name: 'libstatustxt', type: 'string',persist: false  },
                   { name: 'browsershare', type: 'bool' },
                   { name: 'forcerun', type: 'bool' },
                   { name: 'genome_id', type: 'int' },
                   { name: 'crosslink_id', type: 'int' },
                   { name: 'fragmentation_id', type: 'int' },
                   { name: 'worker_id', type: 'int' },
                   { name: 'antibody_id', type: 'int' },
                   { name: 'experimenttype_id', type: 'int' },
                   { name: 'tagspercent', mapping: null, type: 'double', persist: false,
                       convert: function(value, record) {
                           var mapped = record.get('tagsmapped');
                           var total = record.get('tagstotal');
                           if( total !== 0){
                               return ((mapped/total)*100.0).toFixed(2);
                           } else {
                               return 0;
                           }
                       }
                   },
                   { name: 'tagsribopercent', mapping: null, type: 'double', persist: false,
                       convert: function(value, record) {
                           var mapped = record.get('tagsribo');
                           var total = record.get('tagstotal');
                           if( total !== 0){
                               return ((mapped/total)*100.0).toFixed(2);
                           } else {
                               return 0;
                           }
                       }
                   }

               ]
           });
