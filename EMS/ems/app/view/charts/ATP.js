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
//Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit', 'Ext.window.MessageBox']);


Ext.define('EMS.view.charts.ATP',
           {
               extend: 'Ext.chart.Chart',
               style: 'background:#fff',
               animate: false,
               legend: {
                   position: 'top'
               },
               border: 0,
               shadow: false,

               initComponent: function() {
                   var me=this;
                   Ext.applyIf(me, {
                                   store: EMS.store.ATPChart,
                                   shadow: false,
                                   theme: 'Category1',
//                                   items:[{
//                                           type  : 'text',
//                                           text  : me.initialConfig.BNAME,
//                                           font  : 'italic bold 14px Arial',
//                                           width : 100,
//                                           height: 30,
//                                           x : 180,
//                                           y : 23
//                                       }],
                                   axes: [{
                                           type: 'Numeric',
                                           minimum: 0,
                                           maximum: me.initialConfig.MAX,
                                           adjustMaximumByMajorUnit: 1,
                                           decimals: me.initialConfig.PRC,
                                           position: 'left',
                                           fields: ['Y'],
                                           title: 'Average Tag Density (per bp)',
                                           minorTickSteps: 3,
                                           majorTickSteps: 3,
                                           grid: true
                                       }, {
                                           type: 'Numeric',
                                           position: 'bottom',
                                           minimum: me.initialConfig.LEN*-1,
                                           maximum: me.initialConfig.LEN,

                                           fields: ['X'],
                                           title: 'distance from TSS (bases)',
                                           grid: true,
                                           minorTickSteps: 3,
                                           majorTickSteps: 3
                                       }],
                                   series: [{
                                           type: 'line',
                                           axis: 'left',
                                           xField: 'X',
                                           yField: 'Y',
                                           title:[me.initialConfig.BNAME],
                                           showMarkers: false,
                                           style: {
                                               fill: '#3838AA',
                                               stroke: '#3838AA',
                                               'stroke-width': 2
                                           }
                                       }]
                               });

                   me.callParent(arguments);
               }
           });
