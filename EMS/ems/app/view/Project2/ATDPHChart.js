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
    //extend: 'Ext.window.Window',
    extend: 'Ext.Panel',
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
    iconCls: 'chart-heat',
    //    maximizable: true,
    //    closeAction: 'destroy',
    //    collapsible: false,
    //    constrain: true,
    //    minHeight: 350,
    //    minWidth: 300,
    //    height: 900,
    //    width: 1180,
    layout: 'fit',

    rpkmSort: function (m, c) {
        if (!c) return;
        if (this.posid == 1) return;

        var pb = this.up('button');
        var gl = this.chart.data.get('tbl2_id');
        var button = this.original.query('#' + gl + ' button[iconCls=sorted]');

        if (button.length != 0) {
            button[0].setIconCls('sort');
        }

        var adata = this.chart.data.get('rpkmarray');
        if (this.posid > 1) {
            var index_sum = [];
            for (var i = 0; i < adata.length; i++) {
                var sum = adata[i][this.posid - 2];
                index_sum.push({'sum': sum, 'index': i});
            }
            var neworder = this.original.sortAndTakeOrder(index_sum, this.plots.plots);
            pb.setIconCls('sorted');
        } else {
            for (var i = 0; i < this.plots.plots.length; i++) {
                this.plots.plots[i].reorder(null);
            }
        }
    },

    chipSort: function (b) {
        if (b.iconCls == 'sorted') return;
        if (b.menu) return;
        var gl = b.chart.data.get('tbl2_id');
        var button = b.original.query('#' + gl + ' button[iconCls=sorted]');
        if (button.length != 0) {
            if (button[0].menu) {
                for (var c = 0; c < button[0].menu.items.items.length; c++)
                    button[0].menu.items.items[c].setChecked(false);
            }
            button[0].setIconCls('sort');
        }

        var adata = b.chart.data.get('array');
        var index_sum = [];
        for (var i = 0; i < adata.length; i++) {
            var sum = d3.sum(adata[i]);
            index_sum.push({'sum': sum, 'index': i});
        }
        var neworder = b.original.sortAndTakeOrder(index_sum, this.plots.plots);

        b.setIconCls('sorted');
    },

    makeColumn: function (heat, window, plots, rmenu, total) {
        var dumb = {
            xtype: 'panel',
            border: false,
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {

                    xtype: 'container',
                    border: false,
                    height: 20,
                    width: '100%',
                    padding: 0,
                    margin: 0,
                    layout: {
                        type: 'hbox'
                    },
                    items: [
                        {
                            xtype: 'button',
                            iconCls: 'disk',
                            margin: '2 0 0 15',
                            padding: 0,
                            tooltip: 'Save image as svg',
                            text: '',
                            maxHeight: 18,
                            maxWidth: 18,
                            chart: heat,
                            handler: function () {
                                this.chart.saveLocal();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls: 'sort',
                            arrowCls: '',
                            margin: '2 0 0 10',
                            padding: 0,
                            tooltip: 'Sort groupped data by ...',
                            text: '',
                            maxHeight: 18,
                            maxWidth: 18,
                            chart: heat,
                            plots: plots,
                            original: window,
                            menu: rmenu,
                            handler: this.chipSort
                        },
                        {
                            xtype: 'label',
                            margin: '4 0 0 15',
                            text: total,
                            maxHeight: 18,
                            //maxWidth:
                        }
                    ]
                },
                heat
            ]

        };
        return dumb;
    },

    makeRow: function (cols, itemid) {
        var dumb = {
            xtype: 'container',
            itemId: itemid,
            border: false,
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: cols
        };
        return dumb;
    },

    initComponent: function () {
        var me = this;

        var plots = {};
        var chips = {};

        for (var i = 0; i < me.initialConfig.store.getCount(); i++) {
            var stordata = me.initialConfig.store.getAt(i);
            var genelist_id = stordata.get('tbl2_id');

            if (!plots.hasOwnProperty(genelist_id)) {

                plots[genelist_id] = {items: [], plots: []};
                if (stordata.get('rpkmarray').length > 0) {
                    var rpkms = Ext.create('EMS.ux.d3heatRNA', {data: stordata, flex: 1, plotTitle: stordata.get('tbl2_name')});
                    plots[genelist_id].plots.push(rpkms);
                    var menu = [];
                    menu.push({'posid': 0, chart: rpkms, original: this, plots: plots[genelist_id],
                                  'text': 'reset', checkHandler: this.rpkmSort, checked: false,
                                  group: 'itemGroup' + i});
                    menu.push({'posid': 1, chart: rpkms, original: this, plots: plots[genelist_id],
                                  'text': 'cluster', checkHandler: this.rpkmSort, checked: false,
                                  group: 'itemGroup' + i});
                    for (var j = 0; j < stordata.get('rpkmcols').length; j++) {
                        menu.push({'posid': j + 2, chart: rpkms, original: this, plots: plots[genelist_id],
                                      'text': stordata.get('rpkmcols')[j], checkHandler: this.rpkmSort, checked: false,
                                      group: 'itemGroup' + i});
                    }
                    plots[genelist_id].items.push(this.makeColumn(rpkms, this, plots[genelist_id], menu, 'Genes #: ' + stordata.get('rpkmarray').length));
                }
            }
            if (!chips.hasOwnProperty(stordata.get('tbl1_id'))) {
                chips[stordata.get('tbl1_id')]=[];
            }
            var heat = Ext.create('EMS.ux.d3heatChIP', { data: stordata, flex: 1 });
            chips[stordata.get('tbl1_id')].push(heat);
            plots[genelist_id].plots.push(heat);
            plots[genelist_id].items.push(this.makeColumn(heat, this, plots[genelist_id], null));
        }

        var charts = [];
        for (var key in plots) {
            charts.push(this.makeRow(plots[key].items, key));
        }
        me.items =
        [
            {
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: charts
            }
        ];
        me.tbar = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'checkbox',
                        boxLabel: 'Unified expression lvl?',
                        margin: '0 0 0 20',
                        labelAlign: 'left',
                        boxLabelAlign: 'before',
                        checked: false,
                        oldmax: {},
                        oldmin: {},
                        handler: function (c, v) {

                            if (v) {
                                var mx = 0;
                                var mn = 0.1;
                                for (var key in plots) {
                                    this.oldmax[key] = plots[key].plots[0].max;
                                    this.oldmin[key] = plots[key].plots[0].min;
                                    if (mx < plots[key].plots[0].max) {
                                        mx = plots[key].plots[0].max;
                                    }
                                    if (mn > plots[key].plots[0].min) {
                                        mn = plots[key].plots[0].min;
                                    }
                                }
                                for (var key in plots) {
                                    plots[key].plots[0].max = mx;
                                    plots[key].plots[0].min = mn;
                                    plots[key].plots[0].plot();
                                }
                            } else {
                                for (var key in plots) {
                                    plots[key].plots[0].max = this.oldmax[key];
                                    plots[key].plots[0].min = this.oldmin[key];
                                    plots[key].plots[0].plot();
                                }
                            }
                        }
                    },
                    {
                        xtype: 'checkbox',
                        boxLabel: 'Unified enrichment lvl?',
                        margin: '0 0 0 20',
                        labelAlign: 'left',
                        boxLabelAlign: 'before',
                        checked: false,
                        oldmax: {},
                        oldmin: {},
                        handler: function (c, v) {
                            if (v) {
                                for (var key in chips) {
                                    var mx = 0;
                                    for (var i = 0; i < chips[key].length; i++) {
                                        if (mx < chips[key][i].max) {
                                            mx = chips[key][i].max;
                                        }
                                    }
                                    for (var i = 0; i < chips[key].length; i++) {
                                        chips[key][i].oldmax=chips[key][i].max;
                                        chips[key][i].max=mx;
                                        chips[key][i].plot();
                                    }
                                }
                            } else {
                                for (var key in chips) {
                                    for (var i = 0; i < chips[key].length; i++) {
                                        chips[key][i].max=chips[key][i].oldmax;
                                        chips[key][i].plot();
                                    }
                                }
                            }
                        }
                    }

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
                ]
            }
        ];

        me.callParent(arguments);
    },

    sortAndTakeOrder: function (index_sum, plots) {
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

        for (var i = 0; i < plots.length; i++) {
            plots[i].reorder(neworder);
        }
        return neworder;
    }
});


