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


Ext.define('EMS.view.charts.Fence',
           {
               extend: 'Ext.chart.Chart',
               //xtype: 'chart',
               style: 'background:#fff',
               animate: true,
               legend: {
                   position: 'right'
               },

               initComponent: function() {
                   var me=this;
                   Ext.applyIf(me, {
                                   store: EMS.store.Fence,
                                   shadow: true,
                                   theme: 'Category1',
                                   axes: [{
                                           type: 'Numeric',
                                           minimum: 0,
                                           position: 'left',
                                           fields: ['A', 'C', 'T', 'G'],
                                           title: 'Number of Hits',
                                           minorTickSteps: 1,
                                           grid: true
//                                           grid: {
//                                               odd: {
//                                                   opacity: 1,
//                                                   fill: '#ddd',
//                                                   stroke: '#bbb',
//                                                   'stroke-width': 0.5
//                                               }
//                                           }
                                       }, {
                                           type: 'Category',
                                           position: 'bottom',
                                           fields: ['id'],
                                           title: 'Nucleotide position',
                                           grid: true,
                                           majorTickSteps: 10
                                       }],
                                   series: [{
                                           type: 'line',
                                           highlight: {
                                               size: 7,
                                               radius: 7
                                           },
                                           axis: 'left',
                                           xField: 'id',
                                           yField: 'A',
                                           markerConfig: {
                                               type: 'circle',
                                               size: 1,
                                               radius: 1,
                                               'stroke-width': 0
                                           }
                                       }, {
                                           type: 'line',
                                           highlight: {
                                               size: 7,
                                               radius: 7
                                           },
                                           axis: 'left',
                                           //                smooth: true,
                                           xField: 'id',
                                           yField: 'C',
                                           markerConfig: {
                                               type: 'circle',
                                               size: 1,
                                               radius: 1,
                                               'stroke-width': 0
                                           }
                                       }, {
                                           type: 'line',
                                           highlight: {
                                               size: 7,
                                               radius: 7
                                           },
                                           axis: 'left',
                                           //                smooth: true,
                                           //                fill: true,
                                           xField: 'id',
                                           yField: 'T',
                                           markerConfig: {
                                               type: 'circle',
                                               size: 1,
                                               radius: 1,
                                               'stroke-width': 0
                                           }
                                       },{
                                           type: 'line',
                                           highlight: {
                                               size: 7,
                                               radius: 7
                                           },
                                           axis: 'left',
                                           //                smooth: true,
                                           //                fill: true,
                                           xField: 'id',
                                           yField: 'G',
                                           markerConfig: {
                                               type: 'circle',
                                               size: 1,
                                               radius: 1,
                                               'stroke-width': 0
                                           }
                                       },{
                                           type: 'line',
                                           highlight: {
                                               size: 7,
                                               radius: 7
                                           },
                                           axis: 'left',
                                           //                smooth: true,
                                           //                fill: true,
                                           xField: 'id',
                                           yField: 'N',
                                           markerConfig: {
                                               type: 'circle',
                                               size: 1,
                                               radius: 1,
                                               'stroke-width': 0
                                           }
                                       }]
                               });
                   me.callParent(arguments);
               }
           });



//Ext.define('EMS.view.charts.Fence', {
//               extend: 'Ext.window.Window',
//               alias : 'widget.FenceChart',

//               requires: ['Ext.form.Panel'],

//               width: 800,
//               height: 500,
//               minHeight: 400,
//               minWidth: 550,
//               hidden: true,
//               closeAction: 'hide',
//               constrain: true,
//               maximizable: true,
//               title: 'Adaptor Contamenation',
//               //        renderTo: Ext.getBody(),
//               layout: 'fit',

//               tbar: [{
//                       text: 'Save Chart',
//                       handler: function() {
//                           Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
//                               if(choice == 'yes'){
//                                   chart.save({
//                                                  type: 'image/png'
//                                              });
//                               }
//                           });
//                       }
//                   }, {
//                       text: 'Reload Data',
//                       handler: function() {
//                           chart.store.load();
//                       }
//                   }],
//               items: chart
//           });
