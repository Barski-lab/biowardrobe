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
                   { name: 'spikeins', type: 'string' },
                   { name: 'tagstotal', type: 'int' },
                   { name: 'tagsmapped', type: 'int' },
                   { name: 'notes', type: 'string' },
                   { name: 'protocol', type: 'string' },
                   { name: 'filename', type: 'string' },
                   { name: 'libcode', type: 'string' },
                   { name: 'name4browser', type: 'string' },
                   { name: 'browsergrp_id', type: 'int' },
                   { name: 'dateadd', type: 'date' },
                   { name: 'libstatus', type: 'int' },
                   { name: 'libstatustxt', type: 'string' },
                   { name: 'genome_id', type: 'int' },
                   { name: 'crosslink_id', type: 'int' },
                   { name: 'fragmentation_id', type: 'int' },
                   { name: 'worker_id', type: 'int' },
                   { name: 'antibody_id', type: 'int' },
                   { name: 'experimenttype_id', type: 'int' }
               ]
           });
