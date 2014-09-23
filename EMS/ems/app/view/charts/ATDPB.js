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


Ext.define('EMS.view.charts.ATDPB',
           {
               extend: 'Ext.chart.Chart',
               style: 'background:#fff',
               animate: false,
               border: 0,
               shadow: false,
               theme: 'Category1',
               initComponent: function () {
                   var me = this;

                   var genebody = [],
                           series = [],
                           fields = [],
                           data = [];

                   me.legend = {position: 'right'};

                   for (var i = 0; i < me.initialConfig.store.getCount(); i++) {
                       var stordata = me.initialConfig.store.getAt(i);
                       genebody.push(stordata.get('genebody'));
                       fields.push('Y' + i);
                       series.push({
                                       type: 'line',
                                       axis: 'left',
                                       xField: 'X',
                                       yField: fields[i],
                                       title: [stordata.get('pltname')],
                                       showMarkers: false,
                                       style: {
                                           'stroke-width': 2
                                       }
                                   });
                   }

                   var MAX = -Infinity;
                   for (var j = 0; j < genebody[0].length; j++) {
                       var row = {};
                       row['X'] = j;
                       //row.push(j+1);
                       for (var i = 0; i < genebody.length; i++) {
                           if (MAX < genebody[i][j])
                               MAX = genebody[i][j];
                           //row['Y'+i]=genebody[i][j];
                           if (genebody[i][j]) {
                               row['Y' + i] = genebody[i][j];
                               //row.push(genebody[i][j]);
                           } else {
                               row['Y' + i] = 0;
                               //row.push(0);
                           }
                       }
                       data.push(row);
                   }
                   var store = Ext.create('Ext.data.Store', {
                       fields: ['X'].concat(fields),
                       data: data
                   });

                   this.store = store;
                   me.initialConfig.store = store;

                   console.log(MAX, store);

                   var dec = Math.floor(-Math.log(Math.abs(MAX) > 1 ? 0.1 : Math.abs(MAX))/Math.LN10) + 1;
                   var power = Math.pow(10, dec);
                   var entire = Math.floor(MAX * power) + 1;
                   MAX = entire / power;

                   Ext.applyIf(me, {
                       //store: store,
                       axes: [{
                                  type: 'Numeric',
                                  minimum: 0,
                                  maximum: MAX,
                                  adjustMaximumByMajorUnit: 1,
                                  decimals: dec+1,//me.initialConfig.PRC,
                                  position: 'left',
                                  fields: fields,
                                  title: 'Gene Body Average Tag Density',
                                  minorTickSteps: 3,
                                  majorTickSteps: 3,
                                  //grid: true
                              }, {
                                  type: 'Numeric',
                                  position: 'bottom',
                                  minimum: 0,
                                  maximum: genebody[0].length,
                                  fields: ['X'],
                                  //                        title: 'distance from TSS (bases)',
                                  grid: true,
                                  //minorTickSteps: 3,
                                  majorTickSteps: 2,
                                  label: {
                                      renderer: function (value, label, storeItem, item, i, display, animate, index) {
                                          //label.setAttributes({fill:'#080'});
                                          //value = "+" + value;
                                          if (value == 0) {
                                              return '-5k';
                                          }
                                          if (value == 1000) {
                                              return 'TSS';
                                          }
                                          if (value == 2000) {
                                              return 'TES';
                                          }
                                          if (value == 3000) {
                                              return '+5k';
                                          }
                                          return value;
                                      }
                                  }
                              }],
                       series: series
                   });
                   me.callParent(arguments);
               }
           });
