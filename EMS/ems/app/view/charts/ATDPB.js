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

               initComponent: function () {

                   var me = this;
                   var genebody = [],
                           series = [],
                           fields =[],
                           data=[];

                   me.legend = {position: 'right'};

                   for (var i = 0; i < me.initialConfig.stor.getCount(); i++) {
                       var stordata = me.initialConfig.stor.getAt(i);
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
                       console.log(stordata);
                   }
                   var MAX=-Infinity;

                   for(var j=0; j<genebody[0].length;j++) {
                       var row=[];
                       row.push(j+1);
                       for (var i = 0; i < genebody.length; i++) {
                           if(MAX<genebody[i][j])
                            MAX=genebody[i][j];
                           //row['Y'+i]=genebody[i][j];
                           if(genebody[i][j]) {
                               row.push(genebody[i][j]);
                           } else {
                               row.push(0);
                           }
                       }
                       data.push(row);
                   }
                   var store = Ext.create('Ext.data.ArrayStore', {
                       fields: ['X'].concat(fields),
                       data: data
                   });
                   this.store=store;
                   console.log(MAX,store);
                   //var store = Ext.create('Ext.data.JsonStore', {
                   //    fields: ,
                   //    data: data
                   //    //        [
                   //    //    { 'name': 'metric one',   'data1': 10, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
                   //    //    { 'name': 'metric two',   'data1': 7,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
                   //    //    { 'name': 'metric three', 'data1': 5,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
                   //    //    { 'name': 'metric four',  'data1': 2,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
                   //    //    { 'name': 'metric five',  'data1': 4,  'data2': 4,  'data3': 36, 'data4': 13, 'data5': 33 }
                   //    //]
                   //});


                   //}

                   Ext.applyIf(me, {
                                   //store: store,
                                   shadow: false,
                                   theme: 'Category1',
                                   axes: [{
                                           type: 'Numeric',
                                           minimum: 0,
                                           maximum: MAX,
                                           adjustMaximumByMajorUnit: 1,
                   //                        decimals: me.initialConfig.PRC,
                                           position: 'left',
                                           fields: fields,
                                           title: 'Gene Body Average Tag Density',
                                           minorTickSteps: 3,
                                           majorTickSteps: 3,
                                           grid: true
                                       } , {
                                           type: 'Numeric',
                                           position: 'bottom',
                   //                        minimum: me.initialConfig.LEN*-1,
                   //                        maximum: me.initialConfig.LEN,
                   //
                                           fields: ['X'],
                   //                        title: 'distance from TSS (bases)',
                                           grid: true,
                                           minorTickSteps: 3,
                                           majorTickSteps: 3
                                       }],
                                   series: series
                               });
                   //
                   me.callParent(arguments);
               }
           });
