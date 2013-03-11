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

Ext.require('Ext.chart.*');

Ext.define('EMS.view.charts.Spikeins',
           {
               extend: 'Ext.chart.Chart',
               xtype: 'chart',
               style: 'background:#fff',
               animate: true,
               legend: false,

               initComponent: function() {
                   var me=this;
                   Ext.applyIf(me, {

                                   store: EMS.store.SpikeinsChart,
                                   shadow: true,
                                   theme: 'Category1',
                                   axes: [{
                                           type: 'Numeric',
                                           minimum: 0,
                                           position: 'left',
                                           fields: ['concentration'],
                                           title: 'Spikein Concentration',
                                           minorTickSteps: 1,
                                           grid: true
                                       }, {
                                           type: 'Numeric',
                                           minimum: 0,
                                           position: 'bottom',
                                           fields: ['RPKM_0'],
                                           title: 'RPKMs',
                                           minorTickSteps: 1,
                                           grid: true,
                                           majorTickSteps: 10
                                       }],
                                   series: [{
                                           type: 'scatter',
                                           markerConfig: {
                                               type: 'circle',
                                               radius: 3,
                                               size: 3
                                           },
                                           axis: 'left',
                                           yField: 'concentration',
                                           xField: 'RPKM_0'
                                       } , {
                                           type: 'line',
                                           markerConfig: false,
                                           showMarkers: false,
                                           axis: 'left',
                                           yField: 'concentration',
                                           xField: 'line',
                                           style: {
                                               fill: '#000000'
                                           }
                                       }
                                   ]
                               });
                   me.callParent(arguments);
               }
           });
