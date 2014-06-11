/****************************************************************************
 **
 ** Copyright (C) 2011-2014 Andrey Kartashov .
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

Ext.define('EMS.view.Experiment.Experiment.ATPHeat', {
    extend: 'Ext.Panel',
    bodyPadding: 0,
    border: false,
    frame: false,
    layout: 'border',
    plain: true,
    title: 'Average Tag Density Heat',
    iconCls: 'chart-line',
    layout: 'fit',
    data: {},
    items: [
        {
            xtype: 'highchart',
            series: [
                {
                    //type: 'heatmap',
                    xField: 'TSS',
                    yField: 'Gene',
                    dataIndex: 'v',
                    //borderWidth: 0,
                    //colsize: 24 * 3600000, // one day
                }
            ],
            xField: 'TSS',
            yField: 'Gene',
            animation: false,
            chartConfig: {
                chart:{
                    type: 'heatmap',
                    animation: false,
                },
                title : {
                    text : 'Heatmap'
                },
                tooltip: {
                    headerFormat: 'Temperature<br/>',
                    pointFormat: '{point.x:%e %b, %Y} {point.y:%e %b} <b>{point.value}</b>'
                }

            }
        }
    ],
    constructor: function (config) {
        Ext.apply(this, config);
        this.callParent(arguments);
    },
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
    }
});


//        me.items = [
//            {
//                xtype: 'canvasxpress',
//                //                        showExampleData: true,
//                imgDir: '/ems/imagesCanvas/',
//                options: {
//                    imageDir: 'imagesCanvas/',
//                    graphType: 'Heatmap',
//                    heatmapType: 'white-black',
//                    varLabelRotate: 45,
//                    graphOrientation: 'vertical',
//                    zoom: 0,
//                    showSmpDendrogram: false,
//                    showVarDendrogram: false,
//                    //"maxCols": 600
//                },
//                data: me.data
//            }
//        ];
