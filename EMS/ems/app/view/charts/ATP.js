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
               border: 0,
               shadow: false,
               theme: 'Category1',
               store: 'ATDPChart',

               initComponent: function() {
                   var me=this;
                   if(this.store) {
                       this.store = Ext.data.StoreManager.lookup('ATDPChart');
                       console.log(this.store);
                   }
                   var fields=['Y'];
                   var series=[{
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
                               }];
                   me.legend={ position: 'top' };

                   if(typeof me.initialConfig.COLSN !== 'undefined') {
                       fields=me.initialConfig.COLSN;
                       series=[];
                       me.legend={ position: 'right' };

                       for(var i=0; i<me.initialConfig.COLS; i++) {
                           series.push({
                                           type: 'line',
                                           axis: 'left',
                                           xField: 'X',
                                           yField: fields[i],
                                           title:[me.initialConfig.BNAME[i]],
                                           showMarkers: false,
                                           style: {
                                               'stroke-width': 2
                                           }
                                       });
                       }
                   }

                   Ext.applyIf(me, {
                                   //store: EMS.store.ATDPChart,
                                   axes: [{
                                           type: 'Numeric',
                                           minimum: 0,
                                           maximum: me.initialConfig.MAX,
                                           adjustMaximumByMajorUnit: 1,
                                           decimals: me.initialConfig.PRC,
                                           position: 'left',
                                           fields: fields,
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
                                   series: series
                               });

                   me.callParent(arguments);
               }
           });
