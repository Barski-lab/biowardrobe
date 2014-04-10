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

Ext.define('EMS.view.charts.IslandsDistribution',
           {
               extend: 'Ext.chart.Chart',
               style: 'background:#fff',

               border: 0,

               animate: false,
               shadow: true,

               initComponent: function () {
                   var me = this;

                   me.legend = { position: 'right' };

                   Ext.applyIf(me, {
                       store: EMS.store.IslandsDistribution,
                       items: [
                           {
                               type: 'text',
                               text: 'Upstream is [TSS-20k,TSS-2k]',
                               font: '12px Arial',
                               fill: 'green',
                               width: 100,
                               height: 20,
                               x: 40,
                               y: 20
                           },
                           {
                               type: 'text',
                               text: 'Promoter is [TSS-2k,TSS+2k]',
                               font: '12px Arial',
                               fill: 'blue',
                               width: 100,
                               height: 20,
                               x: 40,
                               y: 39
                           }
                       ], series: [
                           {
                               type: 'bar',
                               axis: 'bottom',
                               gutter: 80,
                               xField: 'name',
                               yField: ['Upstream', 'Promoter', 'Exon', 'Intron', 'Intergenic'],
                               stacked: true,
                               yPadding: {
                                   top: 200,
                                   bottom: 100
                               },
//                               tips: {
//                                   trackMouse: true,
//                                   width: 100,
//                                   height: 40,
//                                   renderer: function (storeItem, item) {
//                                       var percent = ((item.value[1] / storeItem.data.Total) * 100);
//                                       this.setTitle(String(item.value[1]) + '<br>' + String(percent.toFixed(2)) + '%');
//                                   }
//                               },
                               label: {
                                   display: 'insideEnd',
                                   field: ['Upstream', 'Promoter', 'Exon', 'Intron', 'Intergenic'],
                                   renderer: function (val, item, storeItem) {
                                       var percent = ((val / storeItem.data.Total) * 100);
                                       return String(val) + ', ' + String(percent.toFixed(2)) + '%';
                                   },
                                   contrast: true
                               }
                           }
                       ],

                       axes: [
                           {
                               type: 'Numeric',
                               position: 'bottom',
                               fields: ['Upstream', 'Promoter', 'Exon', 'Intron', 'Intergenic'],
                               title: 'Islands count'
                           } ,
                           {
                               type: 'Category',
                               position: 'left',
                               fields: ['name'],
                               //padding: "10 10 10 10",
                               label: {
                                   display: 'outside',
                                   'text-anchor': 'middle',
                                   rotate: {
                                       degrees: 270
                                   },
                                   font: 'bold 12px Helvetica'
                               }
                           }
                       ]
                   });

                   me.callParent(arguments);
               }
           });
