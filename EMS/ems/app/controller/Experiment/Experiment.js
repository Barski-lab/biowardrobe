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


//(function (H) {
//    var wrap = H.wrap,
//            seriesTypes = H.seriesTypes;
//
//    /**
//     * Recursively builds a K-D-tree
//     */
//    function KDTree(points, depth) {
//        var axis, median, length = points && points.length;
//
//        if (length) {
//
//            // alternate between the axis
//            axis = ['plotX', 'plotY'][depth % 2];
//
//            // sort point array
//            points.sort(function (a, b) {
//                return a[axis] - b[axis];
//            });
//
//            median = Math.floor(length / 2);
//
//            // build and return node
//            return {
//                point: points[median],
//                left: KDTree(points.slice(0, median), depth + 1),
//                right: KDTree(points.slice(median + 1), depth + 1)
//            };
//
//        }
//    }
//
//    /**
//     * Recursively searches for the nearest neighbour using the given K-D-tree
//     */
//    function nearest(search, tree, depth) {
//        var point = tree.point,
//                axis = ['plotX', 'plotY'][depth % 2],
//                tdist,
//                sideA,
//                sideB,
//                ret = point,
//                nPoint1,
//                nPoint2;
//
//        // Get distance
//        point.dist = Math.pow(search.plotX - point.plotX, 2) +
//                     Math.pow(search.plotY - point.plotY, 2);
//
//        // Pick side based on distance to splitting point
//        tdist = search[axis] - point[axis];
//        sideA = tdist < 0 ? 'left' : 'right';
//
//        // End of tree
//        if (tree[sideA]) {
//            nPoint1 = nearest(search, tree[sideA], depth + 1);
//
//            ret = (nPoint1.dist < ret.dist ? nPoint1 : point);
//
//            sideB = tdist < 0 ? 'right' : 'left';
//            if (tree[sideB]) {
//                // compare distance to current best to splitting point to decide wether to check side B or not
//                if (Math.abs(tdist) < ret.dist) {
//                    nPoint2 = nearest(search, tree[sideB], depth + 1);
//                    ret = (nPoint2.dist < ret.dist ? nPoint2 : ret);
//                }
//            }
//        }
//        return ret;
//    }
//
//    // Extend the heatmap to use the K-D-tree to search for nearest points
//    H.seriesTypes.heatmap.prototype.setTooltipPoints = function () {
//        var series = this;
//
//        this.tree = null;
//        setTimeout(function () {
//            series.tree = KDTree(series.points, 0);
//        });
//    };
//    H.seriesTypes.heatmap.prototype.getNearest = function (search) {
//        if (this.tree) {
//            return nearest(search, this.tree, 0);
//        }
//    };
//
//    H.wrap(H.Pointer.prototype, 'runPointActions', function (proceed, e) {
//        var chart = this.chart;
//        proceed.call(this, e);
//
//        // Draw independent tooltips
//        H.each(chart.series, function (series) {
//            var point;
//            if (series.getNearest) {
//                point = series.getNearest({
//                                              plotX: e.chartX - chart.plotLeft,
//                                              plotY: e.chartY - chart.plotTop
//                                          });
//                if (point) {
//                    point.onMouseOver(e);
//                }
//            }
//        })
//    });
//
//    /**
//     * Get the canvas context for a series
//     */
//    H.Series.prototype.getContext = function () {
//        var canvas;
//        if (!this.ctx) {
//            canvas = document.createElement('canvas');
//            canvas.setAttribute('width', this.chart.plotWidth);
//            canvas.setAttribute('height', this.chart.plotHeight);
//            canvas.style.position = 'absolute';
//            canvas.style.left = this.group.translateX + 'px';
//            canvas.style.top = this.group.translateY + 'px';
//            canvas.style.zIndex = 0;
//            canvas.style.cursor = 'crosshair';
//            this.chart.container.appendChild(canvas);
//            if (canvas.getContext) {
//                this.ctx = canvas.getContext('2d');
//            }
//        }
//        return this.ctx;
//    }
//
//    /**
//     * Wrap the drawPoints method to draw the points in canvas instead of the slower SVG,
//     * that requires one shape each point.
//     */
//    H.wrap(H.seriesTypes.heatmap.prototype, 'drawPoints', function (proceed) {
//
//        var ctx;
//        if (this.chart.renderer.forExport) {
//            // Run SVG shapes
//            proceed.call(this);
//
//        } else {
//
//            if (ctx = this.getContext()) {
//
//                // draw the columns
//                H.each(this.points, function (point) {
//                    var plotY = point.plotY,
//                            shapeArgs;
//
//                    if (plotY !== undefined && !isNaN(plotY) && point.y !== null) {
//                        shapeArgs = point.shapeArgs;
//
//                        ctx.fillStyle = point.pointAttr[''].fill;
//                        ctx.fillRect(shapeArgs.x, shapeArgs.y, shapeArgs.width, shapeArgs.height);
//                    }
//                });
//
//            } else {
//                this.chart.showLoading("Your browser doesn't support HTML5 canvas, <br>please use a modern browser");
//
//                // Uncomment this to provide low-level (slow) support in oldIE. It will cause script errors on
//                // charts with more than a few thousand points.
//                //proceed.call(this);
//            }
//        }
//    });
//}(Highcharts));


Ext.define('EMS.controller.Experiment.Experiment', {
    extend: 'Ext.app.Controller',

    //    models: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
    //             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],
    //    stores: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
    //             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],

    models: ['Preferences', 'EGroup', 'Laboratory', 'Worker', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome', 'Download', 'Fence', 'Fragmentation', 'ATDPChart', 'Islands', 'Antibodies', 'IslandsDistribution', 'RPKM', 'ATDPHeat'],
    stores: ['Preferences', 'EGroups', 'Laboratories', 'Worker', 'Workers', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome', 'Download', 'Fence', 'Fragmentation', 'ATDPChart', 'Islands', 'Antibodies', 'IslandsDistribution', 'RPKM', 'Spikeins', 'ATDPHeat'],

    views: [//'Experiment.Experiment.MainWindow',
        //'Experiment.Experiment.EditForm',
        'Experiment.Experiment.QualityControl',
        'Experiment.Experiment.Islands',
        'Experiment.Experiment.RPKM',
    ],

    requires: [
        'EMS.util.Util',
        'EMS.ux.d3'
    ],


    worker: {},
    save: false,

    init: function () {
        this.control
        ({
             'experimentmainwindow': {
                 render: this.onWindowRendered,
                 show: this.onWindowShow,
                 destroy: this.onDestroy,
                 beforeclose: this.onClose
             },
             'experimentmainwindow button[itemId=save]': {
                 click: this.onExperimentSaveClick
             },
             'experimentmainwindow button[itemId=cancel]': {
                 click: this.onExperimentCancelClick
             },
             'experimenteditform combobox[name=experimenttype_id]': {
                 select: this.onExperimentTypeChange
             },
             'experimenteditform combobox[name=genome_id]': {
                 select: this.onGenomeChange
             },
             'experimenteditform': {
             }
         });
        this.EGroupsStore = Ext.create('EMS.store.EGroups', {storeId: Ext.id()});
        this.EGroupsStore.load();
    },//init
    /****************************
     * Init window functions
     ****************************/
    onDestroy: function () {
        //        this.ATDPChart.destroy();
    },
    onClose: function () {
        if (!this.getLabDataStore().isLoading())
            this.getLabDataStore().rejectChanges();
    },
    onWindowRendered: function (form) {
        var me = this;
        this.worker = this.getWorkerStore().getAt(0);
        this.getDownloadStore().load();
        this.getSpikeinsStore().load();
        this.getController('Experiment.Islands');
        this.getController('Experiment.RPKM');
        Ext.ComponentQuery.query('experimenteditform combobox[name=egroup_id]')[0].bindStore(this.EGroupsStore);

        var form = Ext.ComponentQuery.query('experimenteditform')[0].getForm();
        var record = form.getRecord();

        this.UID = record.data['uid'];
        this.tblname = record.data['filename'].split(';')[0];
        var gdata = this.getGenomeStore().findRecord('id', record.data['genome_id'], 0, false, false, true).data;
        this.spike = (gdata.genome.indexOf('spike') !== -1);
        this.db = gdata.db;


        Ext.ComponentQuery.query('experimenteditform #protocol')[0].UID = this.UID;
        Ext.ComponentQuery.query('experimenteditform #notes')[0].UID = this.UID;

    },
    /******************************
     *
     * Main Logic
     *
     *
     ******************************/
    onWindowShow: function (form) {
        var me = this;

        this.showChipSeq();
        this.showSpike();

        var form = Ext.ComponentQuery.query('experimenteditform')[0].getForm();
        var record = form.getRecord();
        var maintabpanel = Ext.ComponentQuery.query('experimentmainwindow > tabpanel')[0];
        Ext.ComponentQuery.query('experimenteditform combobox[name=egroup_id]')[0].setValue(record.data['egroup_id']);


        this.isRNA = ((Ext.ComponentQuery.query('experimenteditform combobox[name=experimenttype_id]')[0]).getRawValue().indexOf('RNA') !== -1);

        if (this.worker.data['laboratory_id'] != record.data['laboratory_id'] && !this.worker.data.isa)
            this.readOnlyAll(form);


        var sts = parseInt(record.data['libstatus']);
        var base = sts / 1000 | 0;
        sts = sts % 1000;

        form.findField('cells').focus(false, 400);

        if ((sts < 11 && base == 0) || sts < 10)
            form.findField('forcerun').hide();

        if (sts < 11)
            return;

        this.setDisabledByStatus(sts);

        if (sts > 11) {
            this.addQC(maintabpanel, record);
            this.addGB(maintabpanel);
        }

        if (sts > 11 && !this.isRNA) {
            var anti = "";
            if (record.data.antibody_id.length > 1)
                anti = this.getAntibodiesStore().findRecord('id', record.data.antibody_id, 0, false, false, true).data.antibody;

            this.addIslandsList(maintabpanel);
            this.addATDPChart(maintabpanel, record.data.name4browser + " " + anti);
            this.addATDPChartH(maintabpanel, record.data.name4browser + " " + anti);
        }//>11 and not RNA

        if (sts > 11 && this.isRNA) {
            this.addRPKMList(maintabpanel);
            if (this.spike) {
                //this.addSpikeinChart(maintabpanel);
            }
        }//>11 and not RNA

    },

    /****************************
     *
     ****************************/
    onExperimentTypeChange: function () {
        this.showChipSeq();
    },

    /****************************
     *
     ****************************/
    onGenomeChange: function () {
        this.showSpike();
    },

    /****************************
     *  Save and Cancel experiment
     ****************************/
    onExperimentCancelClick: function () {
        Ext.ComponentQuery.query('experimentmainwindow')[0].close();
    },

    onExperimentSaveClick: function (button) {
        var me = this;
        var form = Ext.ComponentQuery.query('experimenteditform')[0].getForm();

        var record = form.getRecord();
        var values = form.getValues();

        var checkboxs = Ext.ComponentQuery.query('experimenteditform checkboxfield');

        checkboxs.forEach(function (item) {
            values[item.name] = item.getValue();
        });

        if (!form.isValid()) {
            EMS.util.Util.showErrorMsg('Please fill required fields');
            return;
        }

        if (form.isDirty()) {
            record.set(values);
            this.getLabDataStore().sync
            ({
                 callback: function () {
                     me.getLabDataStore().load();
                     Ext.ComponentQuery.query('experimentmainwindow')[0].close();
                 }});
        } else {
            Ext.ComponentQuery.query('experimentmainwindow')[0].close();
        }
    },

    /****************************
     *  Interface Disable Functions
     ****************************/

    //-----------------------------------------------------------------------
    // Makes all elements of the form readOnly
    //
    //-----------------------------------------------------------------------

    readOnlyAll: function (form) {
        form.getFields().each(function (field) {
            field.setReadOnly(true);
        });
        //            Ext.getCmp('browser-grp-edit').disable();
    },

    //-----------------------------------------------------------------------
    // Disabling/enabling antibody and fragmentation comboboxes
    //
    //-----------------------------------------------------------------------
    showChipSeq: function () {
        var combo = Ext.ComponentQuery.query('experimenteditform combobox[name=experimenttype_id]')[0];
        if (combo.getRawValue().indexOf('DNA') !== -1) {
            Ext.ComponentQuery.query('experimenteditform #dnasupp')[0].show();
        } else {
            Ext.ComponentQuery.query('experimenteditform #dnasupp')[0].hide();
        }
    },
    //-----------------------------------------------------------------------
    // Disabling/enabling antibody and fragmentation comboboxes
    //
    //-----------------------------------------------------------------------
    setDisabledByStatus: function (sts) {
        var form = Ext.ComponentQuery.query('experimenteditform')[0].getForm();
        if (sts >= 1) {
            form.findField('url').setReadOnly(true);
            form.findField('download_id').setReadOnly(true);
        }
        if (sts >= 10) {
            form.findField('experimenttype_id').setReadOnly(true);
            form.findField('genome_id').setReadOnly(true);
            //form.findField('protocol').setReadOnly(true);
            //form.findField('notes').setReadOnly(true);
            if (!this.worker.data.isa && !this.worker.data.isla) {
                form.findField('name4browser').setReadOnly(true);
                form.findField('egroup_id').setReadOnly(true);
                form.findField('groupping').setReadOnly(true);
                form.findField('fragmentation_id').setReadOnly(true);
                form.findField('crosslink_id').setReadOnly(true);
                form.findField('antibody_id').setReadOnly(true);
                form.findField('antibodycode').setReadOnly(true);
                form.findField('spikeins_id').setReadOnly(true);
                form.findField('dateadd').setReadOnly(true);
                form.findField('cells').setReadOnly(true);
                form.findField('conditions').setReadOnly(true);
            }

            //            Ext.getCmp('browser-grp-edit').disable();
        }
    },

    //-----------------------------------------------------------------------
    // Disabling/enabling spikeins field
    //
    //-----------------------------------------------------------------------
    showSpike: function () {
        var combo = Ext.ComponentQuery.query('experimenteditform combobox[name=genome_id]')[0];

        if (combo.getRawValue().indexOf('spike') !== -1) {
            Ext.ComponentQuery.query('experimenteditform #spikeinsupp')[0].show();
        } else {
            Ext.ComponentQuery.query('experimenteditform #spikeinsupp')[0].hide();
        }
    },


    /*
     * Add Tab functions
     */
    /***********************************************************************
     ***********************************************************************/
    addQC: function (tab, record) {
        this.getFenceStore().load({ params: { recordid: record.get('uid') } });

        tab.add({
                    xtype: 'experimentqualitycontrol',
                    iconCls: 'chart'
                });
        var panelD = Ext.ComponentQuery.query('experimentqualitycontrol panel#experiment-description')[0];
        panelD.on('afterrender', function () {
            var basename = EMS.util.Util.Settings('preliminary') + '/' + this.UID;
            panelD.tpl.overwrite(panelD.body, Ext.apply(record.data, {isRNA: this.isRNA, basename: basename}));


            var store = Ext.create('Ext.data.ArrayStore', {
                autoDestroy: true,
                fields: [
                    {name: 'name', },
                    {name: 'percent', type: 'float'}
                ],
                data: [
                    ['Mapped', record.data['tagspercent']],
                    [this.isRNA ? 'Ribosomal' : 'Suppresed', record.data['tagsribopercent']],
                    ['Mismatch', (100.0 - record.data['tagspercent'] - record.data['tagsribopercent']).toFixed(1)]
                ]
            });
            this.piechart = Ext.create('Ext.chart.Chart', {
                animate: false,
                renderTo: 'experiment-qc-chart',
                height: 120,
                width: 120,
                padding: 0,
                margin: 0,
                store: store,
                shadow: false,
                border: false,
                plain: true,
                //                            layout: 'fit',
                insetPadding: 5,
                theme: 'Base:gradients',
                series: [
                    {
                        type: 'pie',
                        field: 'percent',
                        tips: {
                            trackMouse: true,
                            width: 120,
                            height: 28,
                            font: '9px Arial',
                            renderer: function (storeItem, item) {
                                this.setTitle(storeItem.get('name') + ': ' + storeItem.get('percent') + '%');
                            }
                        },
                        label: {
                            field: 'percent',
                            display: 'rotate',
                            contrast: true,
                            font: '7px Arial'
                        }
                    }
                ]
            });


            tab.setActiveTab(1);
        }, this);

        panelD.on('ondestroy', function () {
            this.piechart.destroy();
        }, this);

    },

    /***********************************************************************
     * Add Genome Browser Tab
     ***********************************************************************/
    addGB: function (tab) {

        var gtbl = this.UID.replace(/-/g, '_') + '_wtrack';
        if (!this.isRNA) {
            gtbl = this.UID.replace(/-/g, '_') + '_grp';
        }
        var url = EMS.util.Util.Settings('genomebrowserroot') + '/cgi-bin/hgTracks?db=' + this.db + '&pix=1050&refGene=full&' + gtbl + '=full';
        tab.add({
                    title: 'Genome browser',
                    iconCls: 'genome-browser',
                    itemId: 'genomebrowser',
                    xtype: 'uxiframe',
                    src: url,
                    origUrl: url
                });
    },
    /***********************************************************************
     * Add average tag density profile tab
     ***********************************************************************/
    addATDPChart: function (tab, bn) {
        var stor = this.getATDPChartStore();
        var me = this;
        stor.getProxy().setExtraParam('tablename', this.UID + '_atdp');
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              var len = Math.abs(records[0].data.X);
                              var max = records[0].data.Y;
                              for (var i = 0; i < records.length; i++) {
                                  if (records[i].data.Y > max)
                                      max = records[i].data.Y;
                              }
                              var prc=0,mx=max;
                              for(;mx<1;prc++)
                                  mx*=10;
                              prc+=2;
                              // = Math.abs(parseInt(max.toString().split('e')[1])) + 2;
                              me.ATDPChart = Ext.create("EMS.view.Experiment.Experiment.ATPChart", {LEN: len, MAX: max, PRC: prc, BNAME: bn});
                              tab.add(me.ATDPChart);
                          }
                      }
                  }, this);
    },
    /***********************************************************************
     * Add average tag density profile tab
     ***********************************************************************/
    addATDPChartH: function (tab, bn) {
        var me = this;
        this.getATDPHeatStore().load();
        tab.add(
                {

                    bodyPadding: 0,
                    border: false,
                    frame: false,
                    layout: 'border',
                    plain: true,
                    title: 'Average Tag Density Heat',
                    iconCls: 'chart-line',
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'd3',
                            store: "ATDPHeat"
                        }]
                });

        /*
        Ext.Ajax.request({
                             url: 'data/ATDPHeat.php',
                             params: {
                                 'tablename': me.UID + "_atdph"
                             },
                             method: 'GET',
                             timeout: 600000, //600 sec
                             success: function (response) {
                                 var json = Ext.decode(response.responseText);
                                 tab.add(
                                         {

                                             bodyPadding: 0,
                                             border: false,
                                             frame: false,
                                             layout: 'border',
                                             plain: true,
                                             title: 'Average Tag Density Heat',
                                             iconCls: 'chart-line',
                                             layout: 'fit',
                                             items: [
                                                 {
                                                     xtype: 'highchart',
                                                     animation: false,
                                                     chartConfig: {
                                                         alignTicks: false,
                                                         exporting: {
                                                             enabled: false
                                                         },
                                                         xAxis: {
                                                             categories: json.data.catx,
                                                             labels: {
                                                                 //enabled: false,
                                                                 //align: 'left',
                                                                 //x: 5,
                                                                 //format: '{value:%B}' // long month
                                                             },
                                                             //showLastLabel: false,
                                                             minorTickLength: 0,
                                                             tickLength: 0,
                                                             tickPositions: [0, json.data.catx.length - 1],
                                                             gridLineWidth: 0,
                                                             minorGridLineWidth: 0,
                                                             startOnTick: false,
                                                             endOnTick: false,
                                                         },
                                                         tooltip: {
                                                             backgroundColor: null,
                                                             borderWidth: 0,
                                                             //distance: 10,
                                                             shadow: false,
                                                             useHTML: true,
                                                             positioner: function (a, b, c) {
                                                                 return {x: 10, y: c.plotY + 80};
                                                             },
                                                             style: {
                                                                 padding: 0,
                                                                 color: 'black'
                                                             },
                                                             formatter: function () {
                                                                 return '<b> TSS ' + this.series.xAxis.categories[this.point.x] + '</b><br>' +
                                                                        '<b> ' + this.series.yAxis.categories[this.point.y] + '</b><br>' +
                                                                        this.point.value;
                                                             }

                                                         },
                                                         legend: {
                                                             align: 'right',
                                                             layout: 'vertical',
                                                             margin: 0,
                                                             verticalAlign: 'top',
                                                             y: 150,
                                                             symbolHeight: 300
                                                         },
                                                         yAxis: {
                                                             categories: json.data.caty,
                                                             title: 'Genes',
                                                             //showLastLabel: false,
                                                             minorTickLength: 0,
                                                             tickLength: 0,
                                                             gridLineWidth: 0,
                                                             tickInterval: json.data.caty.length - 1,
                                                             minorGridLineWidth: 0,
                                                             labels: {
                                                                 enabled: false,
                                                             },
                                                             startOnTick: false,
                                                             endOnTick: false,
                                                             //tickLength: 10
                                                         },
                                                         chart: {
                                                             type: 'heatmap',
                                                             //borderWidth: 1
                                                             //zoomType: 'y',
                                                             plotBorderWidth: 1,
                                                             animation: false,
                                                             width: 500,
                                                             margin: [100, 200, 100, 200]
                                                         },
                                                         title: {
                                                             text: bn
                                                         },
                                                         colorAxis: {
                                                             min: 0,
                                                             max: json.data.max,
                                                             minColor: '#FFFFFF',
                                                             maxColor: '#000000'
                                                         },
                                                         series: [
                                                             {
                                                                 name: 'heat',
                                                                 borderWidth: 0,
                                                                 data: json.data.index,
                                                             }
                                                         ]

                                                     }
                                                 }
                                             ]
                                         });

                                 //me.ATDPChartH = Ext.create("EMS.view.Experiment.Experiment.ATPHeat", {data: json.data});
                                 //tab.add(me.ATDPChartH);
                             },
                             failure: function () {
                                 EMS.util.Util.Logger.log("Cant run error");
                             },
                         });

    */
    },
    /***********************************************************************
     ***********************************************************************/
    addIslandsList: function (tab) {
        var stor = this.getIslandsStore();
        stor.getProxy().setExtraParam('uid', this.UID);
        var me = this;
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              tab.add({
                                          xtype: 'experimentislands'
                                      });
                              me.addIslandsDistributionChart(tab);
                          }
                      }
                  });
    },
    /***********************************************************************
     ***********************************************************************/
    addRPKMList: function (tab) {
        var stor = this.getRPKMStore();
        stor.getProxy().setExtraParam('tablename', this.UID + '_genes');
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              tab.add({
                                          xtype: 'experimentrpkm'
                                      });
                          }
                      }
                  });
    },
    /***********************************************************************
     ***********************************************************************/
    addSpikeinChart: function (tab, lid) {
        var stor = this.getSpikeinsChartStore();
        stor.getProxy().setExtraParam('labdata_id', lid);
        stor.load({
                      callback: function (records, operation, success) {
                          var SpikeinsChart = Ext.create("EMS.view.LabDataEdit.SpikeinsChart");
                          SpikeinsChart.chart.items = [
                              {
                                  type: 'text',
                                  text: 'Y = ' + records[0].data.slope.toFixed(3) + ' * X' + ((records[0].data.inter > 0) ? " +" : ' ') + records[0].data.inter.toFixed(3),
                                  font: 'italic bold 14px Arial',
                                  width: 100,
                                  height: 30,
                                  x: 180, //the sprite x position
                                  y: 23  //the sprite y position
                              } ,
                              {
                                  type: 'text',
                                  text: 'R = ' + records[0].data.R.toFixed(3),
                                  font: 'italic bold 14px Arial',
                                  style: 'italic',
                                  width: 100,
                                  height: 30,
                                  x: 180, //the sprite x position
                                  y: 50  //the sprite y position
                              }
                          ];
                          tab.add(SpikeinsChart);
                      }
                  });
    },
    /***********************************************************************
     ***********************************************************************/
    addIslandsDistributionChart: function (tab) {
        var stor = this.getIslandsDistributionStore();
        stor.getProxy().setExtraParam('uid', this.UID);
        stor.load({
                      callback: function (records, operation, success) {
                          var IslandsDistributionChart = Ext.create("EMS.view.Experiment.Experiment.IslandsDistribution");
                          tab.add(IslandsDistributionChart);
                      }
                  });
    }



});//Ext.define
