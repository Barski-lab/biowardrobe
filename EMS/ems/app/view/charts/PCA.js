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

Ext.define('EMS.view.charts.PCA',
           {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel'],
               title : 'Add Preliminary Results',
               layout: 'fit',
               iconCls: 'default',
               //closeAction: 'hide',
               maximizable: true,
               collapsible: true,
               constrain: true,
               minHeight: 550,
               minWidth: 600,
               height: 550,
               width: 700,



               //extend: 'Ext.chart.Chart',

               initComponent: function() {
                   var me=this;
                   var color=["#F00","#0F0","#00F"];
                   var cross="M-1.7647058823529411,0l-1.7647058823529411,-1.7647058823529411,1.7647058823529411,-1.7647058823529411,1.7647058823529411,1.7647058823529411,1.7647058823529411,-1.7647058823529411,1.7647058823529411,1.7647058823529411,-1.7647058823529411,1.7647058823529411,1.7647058823529411,1.7647058823529411,-1.7647058823529411,1.7647058823529411,-1.7647058823529411,-1.7647058823529411,-1.7647058823529411,1.7647058823529411,-1.7647058823529411,-1.7647058823529411,z";
                   var plus="M-1.1538461538461537,-1.1538461538461537l0,-2.3076923076923075,2.3076923076923075,0,0,2.3076923076923075,2.3076923076923075,0,0,2.3076923076923075,-2.3076923076923075,0,0,2.3076923076923075,-2.3076923076923075,0,0,-2.3076923076923075,-2.3076923076923075,0,0,-2.3076923076923075,z";
                   var types=[cross,plus];
                   var chart=Ext.create('Ext.chart.Chart', {

                                            xtype: 'chart',
                                            style: 'background:#fff',
                                            animate: false,
                                            legend: false,
                                            store: EMS.store.PCAChart,
                                            shadow: false,
                                            theme: 'Category1',
                                            axes: [{
                                                    type: 'Numeric',
                                                    position: 'left',
                                                    fields: ['PC22'],
                                                    title: 'PC2',
                                                    //minorTickSteps: 1,
                                                    grid: true
                                                }, {
                                                    type: 'Numeric',
                                                    position: 'bottom',
                                                    fields: ['PC11'],
                                                    title: 'PC1',
                                                    //minorTickSteps: 1,
                                                    grid: true,
                                                    //majorTickSteps: 10
                                                }],
                                            series: [{
                                                    type: 'scatter',
                                                    markerConfig: {
                                                        type: 'diamond',
                                                        radius: 4,
                                                        size: 4
                                                    },
                                                    axis: 'left',
                                                    label: {
                                                        display: 'under',
                                                        minMargin: '70'
                                                        //color:
                                                    },
                                                    renderer: function(sprite, record, attr, index){

                                                        //console.log(record.get('color'),index,sprite,attr,this);

                                                        var highlight = record.get('color');
                                                        if(highlight===1)
                                                            sprite.type='circle';
                                                        if(highlight===1)
                                                            return Ext.apply(attr, { fill: color[highlight-1], radius: 6, size: 6 });
                                                        if(highlight > 1 && highlight < 4)
                                                            return Ext.apply(attr, { fill: color[highlight-1], path: types[highlight-2] });
                                                    },
                                                    yField: 'PC22',
                                                    xField: 'PC11'
                                                }
                                            ]
                                        });
                   me.items=[chart];
                   me.callParent(arguments);
               }
           });
