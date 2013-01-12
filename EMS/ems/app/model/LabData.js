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
                   'cells',
                   'conditions',
                   'spikeinspool',
                   'spikeins',
                   { name: 'tagstotal', type: 'int' },
                   { name: 'tagsmapped', type: 'int' },
                   'libcode',
                   'name4browser',
                   'notes',
                   'protocol',
                   'filename',
                   { name: 'dateadd', type: 'date' },
                   { name: 'libstatus', type: 'int' },
                   'libstatustxt',
                   { name: 'genome_id', type: 'int' },
                   { name: 'crosslink_id', type: 'int' },
                   { name: 'fragmentation_id', type: 'int' },
                   { name: 'worker_id', type: 'int' },
                   { name: 'antibody_id', type: 'int' },
                   { name: 'experimenttype_id', type: 'int' }
               ]
           });

//#{"ID":"1","WORKER_ID":null,"LibCode":"ABAB4","Name4browser":"Naive CD4 Pol II","genomeType":"1",
//#"libStatus":null,"libStatusTxt":null,"IndexRun":"11","Type":"1","Cells":"Human Naive CD4 T cells (CD45R0-CD27+)",
//#"Tags_total":null,"Tags_mapped":null,"Mapping_cond":null,"Chip_cond":null,"Crosslink":"2","fragmentation":null,
//#"antibody":null,"protocol":null,"spikeinspool":null,"spikeins":null},
