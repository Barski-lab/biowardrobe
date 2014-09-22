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
                       var row={};
                       row['X']=j;
                       //row.push(j+1);
                       for (var i = 0; i < genebody.length; i++) {
                           if(MAX<genebody[i][j])
                            MAX=genebody[i][j];
                           //row['Y'+i]=genebody[i][j];
                           if(genebody[i][j]) {
                               row['Y'+i]=genebody[i][j];
                               //row.push(genebody[i][j]);
                           } else {
                               row['Y'+i]=0;
                               //row.push(0);
                           }
                       }
                       data.push(row);
                   }
                   var store = Ext.create('Ext.data.Store', {
                       fields: ['X'].concat(fields),
                       data: data
                   });
                   this.store=store;
                   me.initialConfig.store=store;
                   console.log(MAX,store);

                   Ext.applyIf(me, {
                                   //store: store,
                                   shadow: false,
                                   theme: 'Category1',
                                   axes: [{
                                           type: 'Numeric',
                                           minimum: 0,
                                           maximum: MAX,
                                           adjustMaximumByMajorUnit: 1,
                                           decimals: Math.floor(-Math.log(Math.abs(MAX)))+1,//me.initialConfig.PRC,
                                           position: 'left',
                                           fields: fields,
                                           title: 'Gene Body Average Tag Density',
                                           minorTickSteps: 3,
                                           majorTickSteps: 3,
                                           //grid: true
                                       } , {
                                           type: 'Numeric',
                                           position: 'bottom',
                                           minimum: 0,//me.initialConfig.LEN*-1,
                                           maximum: 3000,//me.initialConfig.LEN,
                   //
                                           fields: ['X'],
                   //                        title: 'distance from TSS (bases)',
                                           grid: true,
                                           //minorTickSteps: 3,
                                           majorTickSteps: 2
                                       }],
                                   series: series
                               });
                   //
                   me.callParent(arguments);
               }
           });
