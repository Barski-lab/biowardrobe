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

Ext.define( 'EMS.view.EMSMenu' ,{
               extend: 'Ext.panel.Panel',
               alias : 'widget.EMSMenu',

               tbar: [
                   {
                       xtype: 'button',
                       text:'Forms',
                       tooltip:'Laboratory data edit',
                       menu: [
                           { text: 'Laboratory data', action: 'LabData', tooltip: 'Laboratory data edit',iconCls: 'form-blue-edit' },
                           { text: 'Experiment design', action: 'ExperimentDesign', tooltip: 'Experement design',iconCls: '' },
                           '-',
                           { text: 'Workers', action: 'Workers', tooltip: 'List of workers',iconCls: 'users3-edit', id: "MenuWorkers" }
                       ],
                       iconCls:'form-blue'
                   } /*, { xtype: 'button',
                       text:'Reports',
                       tooltip:'Some reports',
                       menu: [
                           { text: 'Adaptor contamination', action: 'AdaptorCont', tooltip: '',iconCls: 'chart' },
                           { text: 'Average Tag Density', action: 'ATD', tooltip: '',iconCls: 'chart-line' }
                       ],
                       iconCls:'magazine-folder'
                   } , { xtype: 'button',
                       text:'Genome Browsers',
                       tooltip:'Genome browsers',
                       menu: [
                           { text: 'UCSC Genome browser', action: 'GenomeBrowser', tooltip: '',iconCls: 'genome-browser' }
                       ],
                       iconCls:'genome-browser'
                   }*/,
                   { xtype: 'button',
                       text:'Patients',
                       tooltip:'Patient\'s data',
                       menu: [
                           { text: 'List', action: 'List', tooltip: '',iconCls: 'icon-grid' }
                       ],
                       iconCls:'users3'
                   },
                   { xtype: 'button',
                       text:'Catalogues',
                       tooltip:'',
                       menu: [
                           { text: 'Antibodies', action: 'Antibodies', tooltip: 'List of antibodies',iconCls: 'battery-green' },
                           { text: 'Crosslink type', action: 'CrossType', tooltip: 'Crosslink type',iconCls: 'atom' },
                           { text: 'Experiment type', action: 'ExpType', tooltip: 'Experiment type',iconCls: 'bottle-pills' },
                           { text: 'Fragmentation type', action: 'FragmentType', tooltip: 'Fragmentation type',iconCls: 'army-knife' },
                           { text: 'Genome type', action: 'GenomeType', tooltip: 'Genome type',iconCls: '' },
                           { text: 'Spikeins', action: 'Spikeins', tooltip: 'Spikeins',iconCls: 'surveillance-camera' }
                       ],
                       iconCls:'folder-document'
                   },
                   { xtype: 'button',
                       text:'Tools',
                       tooltip:'',
                       menu: [
                           { text: 'Sequence cutter', action: 'SeqCut', tooltip: 'Tool to cutting sequence into pieces',iconCls: 'cut' },
                       ],
                       iconCls:'wrench'
                   },
                   { xtype: 'button',
                       text:'Notes for supplemental',
                       tooltip:'',
                       menu: [
                           { text: 'Notes', action: 'SuppNotes', tooltip: 'Notes about pipelines for supplemental material',iconCls: 'notebook-edit' }
                       ],
                       iconCls:'notebook-edit'
                   },
                   { xtype: 'tbfill' },
                   { xtype: 'button',
                       text:'Help',
                       tooltip:'',
                       menu: [
                           { text: 'Help', action: 'Help', tooltip: '',iconCls: 'help' },
                           { text: 'About', action: 'About', tooltip: '',iconCls: 'about' }
                       ],
                       iconCls:'question_and_answer'
                   },
               ]
           });
