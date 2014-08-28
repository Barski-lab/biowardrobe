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

Ext.define('EMS.view.Project2.ATDPHChart', {
    extend: 'Ext.window.Window',
    bodyPadding: 0,
    requires: [
        'EMS.ux.d3',
        'EMS.ux.d3heat',
        'EMS.ux.d3heatChIP',
        'EMS.ux.d3heatRNA'
    ],

    border: false,
    frame: false,
    plain: true,
    title: 'Tag Density Heatmap',
    iconCls: 'chart-line',
    maximizable: true,
    closeAction: 'destroy',
    collapsible: false,
    constrain: true,
    minHeight: 350,
    minWidth: 300,
    height: 900,
    width: 1180,
    layout: 'fit',


    initComponent: function () {
        var me = this;
        var chipcombodata = [];
        var rnacombodata = [];
        this.totalPlots = me.initialConfig.store.getCount();
        var chart = [];
        var charts = [];
        for (var i = 0; i < this.totalPlots; i++) {
            var stordata = me.initialConfig.store.getAt(i);
            chipcombodata.push({"id": i, "name": stordata.get('pltname')});
            var heat = Ext.create('EMS.ux.d3heatChIP', { data: stordata, flex: 1 })
            chart.push(heat);
            charts.push
            ({
                 xtype: 'panel',
                 border: false,
                 flex: 1,
                 layout: {
                     type: 'vbox',
                     align: 'stretch'
                 },
                 items: [
                     {
                         xtype: 'button',
                         iconCls: 'disk',
                         margin: '5 0 0 20',
                         padding: 0,
                         tooltip: 'Save image as svg',
                         text: '',
                         maxHeight: 17,
                         maxWidth: 17,
                         chart: heat,
                         handler: function () {
                             this.chart.saveLocal();
                         }
                     },
                     heat
                 ]

             });
        }

        if (me.initialConfig.store.getAt(0).get('rpkmarray').length > 0) {
            var heat = Ext.create('EMS.ux.d3heatRNA', {data: me.initialConfig.store.getAt(0), flex: 1, plotTitle: "Expression"});
            chart.push(heat);
            charts.push
            ({
                 xtype: 'panel',
                 border: false,
                 flex: 1,
                 layout: {
                     type: 'vbox',
                     align: 'stretch'
                 },
                 items: [
                     {
                         xtype: 'button',
                         iconCls: 'disk',
                         margin: '5 0 0 20',
                         padding: 0,
                         tooltip: 'Save image as svg',
                         text: '',
                         maxHeight: 17,
                         maxWidth: 17,
                         chart: heat,
                         handler: function () {
                             this.chart.saveLocal();
                         }
                     },
                     heat
                 ]

             });
            this.totalPlots++;
            for (var j = 0; j < me.initialConfig.store.getAt(0).get('rpkmcols').length; j++)
                rnacombodata.push({'id': j, 'name': me.initialConfig.store.getAt(0).get('rpkmcols')[j]});
        }

        me.tbar = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [
                    /*
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
                     {xtype: 'hiddenfield', name: 'id', value: me.initialConfig.BNAME},
                     {xtype: 'hiddenfield', name: 'type', value: "image/svg+xml"},
                     {xtype: 'hiddenfield', name: 'svg', value: me.chart.save({type: 'image/svg+xml'})}
                     ]
                     });
                     p.getForm().submit
                     ({
                     success: function (form, action) {
                     p.destroy();
                     }
                     });
                     }
                     },*/
                    {
                        xtype: 'combo',
                        width: 300,
                        margin: '0 0 0 10',
                        fieldLabel: 'Sort by enrichment',
                        editable: false,
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name'],
                            data: chipcombodata
                        }),
                        listeners: {
                            scope: this,
                            'select': function (combo, records) {
                                var stordata = me.initialConfig.store.getAt(records[0].data.id);
                                var enrichment = stordata.get('array');
                                var index_sum = [];
                                for (var i = 0; i < enrichment.length; i++) {
                                    var sum = d3.sum(enrichment[i]);
                                    index_sum.push({'sum': sum, 'index': i});
                                }
                                var neworder = this.sortAndTakeOrder(index_sum);

                                for (var i = 0; i < this.totalPlots; i++) {
                                    chart[i].reorder(neworder);
                                }
                            }
                        },
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id'
                    },
                    {
                        xtype: 'combo',
                        width: 300,
                        margin: '0 0 0 10',
                        fieldLabel: 'Sort by expression',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name'],
                            data: rnacombodata
                        }),
                        listeners: {
                            scope: this,
                            'select': function (combo, records) {
                                var stordata = me.initialConfig.store.getAt(0);
                                var enrichment = stordata.get('rpkmarray');
                                var index_sum = [];
                                for (var i = 0; i < enrichment.length; i++) {
                                    var sum = enrichment[i][records[0].data.id];
                                    index_sum.push({'sum': sum, 'index': i});
                                }
                                var neworder = this.sortAndTakeOrder(index_sum);
                                for (var i = 0; i < this.totalPlots; i++) {
                                    chart[i].reorder(neworder);
                                }
                            }
                        },
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'id'
                    }

                ]
            }
        ];
        me.items =
        [
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: charts
            }
        ];//me.chart;

        me.callParent(arguments);
    },

    sortAndTakeOrder: function (index_sum) {
        index_sum.sort(function (a, b) {
            if (a.sum > b.sum)
                return 1;
            if (a.sum < b.sum)
                return -1;
            return 0
        });
        var neworder = [];

        for (var i = 0; i < index_sum.length; i++) {
            neworder[index_sum[i].index] = i;
        }
        return neworder;
    }
});


