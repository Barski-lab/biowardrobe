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

Ext.require('Ext.chart.*');

Ext.define('EMS.view.charts.Fence', {
    extend: 'Ext.Panel',//chart.Chart',
    alias: 'widget.chartfence',
    store: 'Fence',
    layout: 'fit',
    initComponent: function () {
        var me = this;

        this.chart = Ext.create('Ext.chart.Chart', {
                                    style: 'background:#fff',
                                    animate: true,
                                    legend: {
                                        position: 'right'
                                    },
                                    store: me.initialConfig.store,
                                    shadow: true,
                                    theme: 'Category1',
                                    axes: [
                                        {
                                            type: 'Numeric',
                                            minimum: 0,
                                            position: 'left',
                                            fields: ['A', 'C', 'T', 'G', 'N'],
                                            title: 'Frequency',
                                            minorTickSteps: 1,
                                            grid: true
                                        },
                                        {
                                            type: 'Category',
                                            position: 'bottom',
                                            fields: ['id'],
                                            title: 'Nucleotide position',
                                            grid: true,
                                            majorTickSteps: 10
                                        }
                                    ],
                                    series: [
                                        {
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
                                        },
                                        {
                                            type: 'line',
                                            highlight: {
                                                size: 7,
                                                radius: 7
                                            },
                                            axis: 'left',
                                            xField: 'id',
                                            yField: 'C',
                                            markerConfig: {
                                                type: 'circle',
                                                size: 1,
                                                radius: 1,
                                                'stroke-width': 0
                                            }
                                        },
                                        {
                                            type: 'line',
                                            highlight: {
                                                size: 7,
                                                radius: 7
                                            },
                                            axis: 'left',
                                            xField: 'id',
                                            yField: 'T',
                                            markerConfig: {
                                                type: 'circle',
                                                size: 1,
                                                radius: 1,
                                                'stroke-width': 0
                                            }
                                        },
                                        {
                                            type: 'line',
                                            highlight: {
                                                size: 7,
                                                radius: 7
                                            },
                                            axis: 'left',
                                            xField: 'id',
                                            yField: 'G',
                                            markerConfig: {
                                                type: 'circle',
                                                size: 1,
                                                radius: 1,
                                                'stroke-width': 0
                                            }
                                        },
                                        {
                                            type: 'line',
                                            highlight: {
                                                size: 7,
                                                radius: 7
                                            },
                                            axis: 'left',
                                            xField: 'id',
                                            yField: 'N',
                                            markerConfig: {
                                                type: 'circle',
                                                size: 1,
                                                radius: 1,
                                                'stroke-width': 0
                                            }
                                        }
                                    ]
                                }
        );


        this.tbar = [{
                         xtype: 'fieldcontainer',
                         layout: 'hbox',
                         items: [
                             {
                                 xtype: 'button',
                                 text: 'Save Chart',
                                 iconCls: 'svg-logo',
                                 handler: function () {
                                     var p = Ext.create('Ext.form.Panel', {
                                         standardSubmit: true,
                                         url: 'data/svg.php',
                                         hidden: true,
                                         items: [
                                             //{xtype: 'hiddenfield', name: 'id', value: me.initialConfig.plotTitle},
                                             {xtype: 'hiddenfield', name: 'type', value: "image/svg+xml"},
                                             {xtype: 'hiddenfield', name: 'svg', value: me.chart.save()}
                                         ]
                                     });
                                     p.getForm().submit
                                     ({
                                          success: function (form, action) {
                                              p.destroy();
                                          }
                                      });
                                 }
                             }
                         ]
                     }];
        me.items = me.chart;
        me.callParent(arguments);
    },
    onDestroy: function () {
        this.chart.destroy();
        this.callParent(arguments);
    },
});
