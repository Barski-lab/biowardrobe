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


Ext.define('EMS.controller.Experiment.Experiment', {
    extend: 'Ext.app.Controller',

    models: ['Preferences', 'EGroup', 'Laboratory', 'Worker', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome', 'Download', 'Fence', 'Fragmentation', 'ATDPChart', 'Islands', 'Antibodies', 'IslandsDistribution', 'RPKM', 'ATDPHeat'],
    stores: ['Preferences', 'EGroups', 'EControls', 'Laboratories', 'Worker', 'Workers', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome', 'Download', 'Fence', 'Fragmentation', 'ATDPChart', 'Islands', 'Antibodies', 'IslandsDistribution', 'RPKM', 'Spikeins', 'ATDPHeat'],

    views: [//'Experiment.Experiment.MainWindow',
        //'Experiment.Experiment.EditForm',
        'Experiment.Experiment.QualityControl',
        'Experiment.Experiment.Islands',
        'Experiment.Experiment.RPKM',
        'Experiment.Experiment.R'
    ],

    requires: [
        'EMS.util.Util',
        'EMS.ux.d3',
        'EMS.ux.d3heat',
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
             'experimenteditform checkbox[name=control]': {
                 change: this.onControlChange
             },
             'experimenteditform': {}
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
    onWindowRendered: function (f) {
        var me = this;
        this.worker = this.getWorkerStore().getAt(0);
        this.getDownloadStore().load();
        this.getSpikeinsStore().load();
        this.getEControlsStore().load();
        this.getController('Experiment.Islands');
        this.getController('Experiment.RPKM');
        this.getController('Experiment.R');

        var form = f.down('experimenteditform');
        form.down('combobox[name=egroup_id]').bindStore(this.EGroupsStore);

        var record = form.getForm().getRecord();
	this.record = record;
        var uid = record.data['uid'];
        this.UID = uid;
        this.VID = record.data['id'];
        var _tmp_find=this.EGroupsStore.findRecord('id', record.data['egroup_id'], 0, false, false, true);
        if(_tmp_find)
            this.Shadow = _tmp_find.data['shadow'];

        //this.tblname = record.data['filename'].split(';')[0];
        var gdata = this.getGenomeStore().findRecord('id', record.data['genome_id'], 0, false, false, true).data;
        this.spike = (gdata.genome.indexOf('spike') !== -1);
        this.db = gdata.db;

        form.down("#protocol").UID = uid;
        form.down("#notes").UID = uid;

        //Ext.ComponentQuery.query('experimenteditform #protocol')[0].UID = this.UID;
        //Ext.ComponentQuery.query('experimenteditform #notes')[0].UID = this.UID;

    },
    /******************************
     *
     * Main Logic
     *
     *
     ******************************/
    onWindowShow: function (w) {
        var me = this;

        this.showChipSeq(w);
        this.showSpike(w);
        this.showControled(w);

        var form = w.down('experimenteditform').getForm();
	this.MWindow = form;
        var record = form.getRecord();
        var maintabpanel = w.down('tabpanel');
        w.down('experimenteditform combobox[name=egroup_id]').setValue(record.data['egroup_id']);
        var tmp = (w.down('experimenteditform combobox[name=experimenttype_id]')).getRawValue();
        this.isRNA = (tmp.indexOf('RNA') !== -1);
        this.isPAIR = (tmp.indexOf('pair') !== -1);
        this.RecordData = record.data;

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

        this.setDisabledByStatus(sts,w);

        if (sts > 11) {
            this.addQC(maintabpanel, record);
            this.addGB(maintabpanel);
            this.addR(maintabpanel);
        }

        if (sts > 11 && !this.isRNA) {
            var anti = "";
            if (record.data.antibody_id.length > 1)
                anti = this.getAntibodiesStore().findRecord('id', record.data.antibody_id, 0, false, false, true).data.antibody;

            this.addIslandsList(maintabpanel);
            this.addATDPChart(maintabpanel, record.data.name4browser + " " + anti);
            //this.addATDPChartH(maintabpanel, record.data.name4browser + " " + anti);
        }//>11 and not RNA

        if (sts > 11 && this.isRNA) {
            this.addRPKMList(maintabpanel);
            if (this.spike) {
                //this.addSpikeinChart(maintabpanel);
            }
        }//>11 and not RNA

        if (sts > 11) {
            this.addGBHUB(maintabpanel);
            this.addWUHUB(maintabpanel);
        }

    },

    /****************************
     *
     ****************************/
    onExperimentTypeChange: function (c) {
        this.showChipSeq(c.up('window'));
    },

    /****************************
     *
     ****************************/
    onGenomeChange: function (c) {
        this.showSpike(c.up('window'));
    },

    /****************************
     *
     ****************************/
    onControlChange: function (a,b) {
        var win = a.up('window');
        win.down('experimenteditform combobox[name=control_id]').setValue(null);
	this.record.set('control_id',null);
    },

    /****************************
     *  Save and Cancel experiment
     ****************************/
    onExperimentCancelClick: function (button) {
        button.up('window').close();
    },

    onExperimentSaveClick: function (button) {
        var me = this;
        var win = button.up('window');
        var f = win.down('experimenteditform');
        var form = f.getForm();
        var record = form.getRecord();
        var values = form.getValues();

        var checkboxs = f.query('checkboxfield');
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
                     win.close();
                 }
             });
        } else {
            win.close();
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
    },

    //-----------------------------------------------------------------------
    // Disabling/enabling antibody and fragmentation comboboxes
    //
    //-----------------------------------------------------------------------
    showChipSeq: function (w) {
        var combo = w.down('experimenteditform combobox[name=experimenttype_id]');
        if (combo.getRawValue().indexOf('DNA') !== -1) {
            w.down('experimenteditform #dnasupp').show();
        } else {
            w.down('experimenteditform #dnasupp').hide();
        }
    },
    //-----------------------------------------------------------------------
    // Disabling/enabling antibody and fragmentation comboboxes
    //
    //-----------------------------------------------------------------------
    setDisabledByStatus: function (sts,w) {
        var form = w.down('experimenteditform').getForm();
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
    // Disabling/enabling control and controled
    //
    //-----------------------------------------------------------------------
    showControled: function (w) {
        var form = w.down('experimenteditform').getForm();
        if (form.findField('control').getValue()) {
            form.findField('control_id').setReadOnly(true);
        } else {
            form.findField('control_id').setReadOnly(false);
        }
    },

    //-----------------------------------------------------------------------
    // Disabling/enabling spikeins field
    //
    //-----------------------------------------------------------------------
    showSpike: function (w) {
        var combo = w.down('experimenteditform combobox[name=genome_id]');

        if (combo.getRawValue().indexOf('spike') !== -1) {
            w.down('experimenteditform #spikeinsupp').show();
        } else {
            w.down('experimenteditform #spikeinsupp').hide();
        }
    },


    /*
     * Add Tab functions
     */
    /***********************************************************************
     ***********************************************************************/
    addQC: function (tab, record) {
        this.getFenceStore().load({params: {recordid: record.get('uid')}});

        var atab = tab.add({
                               xtype: 'experimentqualitycontrol',
                               iconCls: 'chart',
                           });

        if (this.isPAIR) {
            var store = Ext.create('EMS.store.Fence', {storeId: Ext.id()});//, autoDestroy: true
            store.load({params: {recordid: record.get('uid'), pair: true}});
            var qctabs = atab.down('#experimentqcwindowtabpanel');

            qctabs.add({
                           title: 'Base frequency plot Pair',
                           xtype: 'chartfence',
                           store: store
                       });
            qctabs.add({
                           xtype: 'qcboxplot',
                           title: 'QC Pair',
                           store: store,
                           xAxisName: 'Nucleotide position',
                           yAxisName: 'Quality score',
                       });
        }

        var panelD = tab.query('experimentqualitycontrol panel#experiment-description')[0];
        panelD.on('afterrender', function () {
            var basename = EMS.util.Util.Settings('preliminary') + '/' + this.UID;
            var chartid=Ext.id();
            panelD.tpl.overwrite(panelD.body, Ext.apply(record.data, {isRNA: this.isRNA, basename: basename, chartid: chartid}));


            var store = Ext.create('Ext.data.ArrayStore', {
                autoDestroy: true,
                fields: [
                    {name: 'name',},
                    {name: 'percent', type: 'float'}
                ],
                data: [
                    [this.isRNA ? 'Transcriptome' : 'Mapped', record.data['tagsuniqpercent']],
                    ['Multi-mapped', record.data['tagsspercent']],
                    ['Unmapped', record.data['tagsupercent']],
                    [this.isRNA ? 'Outside annotation' : 'Duplicates', record.data['tagsexpercent']],
                ]
            });

            this.piechart = Ext.create('Ext.chart.Chart', {
                animate: false,
                renderTo: chartid,
                height: 160,
                width: 160,
                padding: 0,
                margin: 0,
                store: store,
                shadow: true,
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
                            font: '9px Arial',
                            renderer: function (storeItem, item) {
                                this.setTitle(storeItem.get('name') + ': ' + storeItem.get('percent') + '%');
                            }
                        },
                        label: {
                            field: 'percent',
                            display: 'rotate',
                            contrast: true,
                            font: '12px Arial'
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
     * Add Genome Browser Hub Tab
     ***********************************************************************/
    addGBHUB: function (tab) {

        var url ='https://genome.ucsc.edu/cgi-bin/hgTracks?db=' + this.db + '&pix=1050&refGene=full&hubClear=https://genomebrowser.research.cchmc.org/hubs/ucsc/'+
                 this.Shadow+'/'+this.VID+'.txt';

        console.log(url);

        tab.add({
            title: 'UCSC Hub',
            iconCls: 'genome-browser',
            itemId: 'ucschub',
            xtype: 'uxiframe',
            src: url,
            origUrl: url
        });
    },
    /***********************************************************************
     * Add WUSTL Browser Hub Tab
     ***********************************************************************/
    addWUHUB: function (tab) {
        var url ='https://genomebrowser.research.cchmc.org/browser/?genome=' + this.db +
                 '&datahub=https://genomebrowser.research.cchmc.org/hubs/wustl/'+ this.Shadow+'/' + this.db + '/trackDb.txt';

        console.log(url);

        tab.add({
            title: 'WUSTL Hub',
            //iconCls: 'genome-browser',
            itemId: 'wustlhub',
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
                              var prc = 0, mx = max;
                              for (; mx < 1; prc++)
                                  mx *= 10;
                              prc += 2;
                              // = Math.abs(parseInt(max.toString().split('e')[1])) + 2;
                              me.ATDPChart = Ext.create("EMS.view.Experiment.Experiment.ATPChart", {
                                  LEN: len,
                                  MAX: max,
                                  PRC: prc,
                                  BNAME: bn
                              });
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
        var store = this.getATDPHeatStore();
        store.getProxy().setExtraParam('tablename', this.UID + '_atdph');
        me.ATDPHeat = Ext.create("EMS.view.Experiment.Experiment.ATPHeat", {store: store, plotTitle: bn});
        var tabadded = tab.add(me.ATDPHeat);
        var icon = me.ATDPHeat.iconCls;
        tabadded.setDisabled(true);
        tabadded.setIconCls('loading');
        store.load({
                       callback: function (records, operation, success) {
                           if (success) {
                               tabadded.setDisabled(false);
                               tabadded.setIconCls(icon);
                           } else {
                               tabadded.setIconCls(icon);
                               tab.remove(tabadded);
                           }
                       }
                   });
    },
    /***********************************************************************
     * Add R tab
     ***********************************************************************/
    addR: function (tab, bn) {
        var me = this;
        me.Rtab = Ext.create("EMS.view.Experiment.Experiment.R", {UID: this.UID});
        var tabadded = tab.add(me.Rtab);
        //var icon = me.Rtab.iconCls;
    },
    /***********************************************************************
     ***********************************************************************/
    addIslandsList: function (tab) {
        var stor = this.getIslandsStore();
        stor.getProxy().setExtraParam('uid', this.UID);

        tab.add({
                    xtype: 'experimentislands'
                });

        var me = this;
        var params = Ext.decode(me.RecordData['params'],true);
        var l = true;

        if(params) {
            var gridFilter = tab.down('experimentislands grid').filters;//Ext.ComponentQuery.query('experimentislands grid')[0].filters;
            var check = tab.down('experimentislands checkboxfield');
            if (params['uniqislands'] == true || params['uniqislands'] == "true")
                check.setValue(true);
            var obj = {};
            if (params.filter) {
                for (var j = 0; j < params.filter.length; j++) {
                    var f = gridFilter.getFilter(params.filter[j].field);
                    if (!f) continue;
                    if (params.filter[j].type == "numeric") {
                        if (!obj[params.filter[j].field])
                            obj[params.filter[j].field] = {};
                        obj[params.filter[j].field][params.filter[j].comparison] = params.filter[j].value;
                        f.setValue(obj[params.filter[j].field]);
                    }
                    if (params.filter[j].type == "string") {
                        f.setValue(params.filter[j].value);
                    }
                    l = false;
                    f.setActive(true);
                }
            }
            tab.down('experimentislands #promoter').setValue(params['promoter']);
        }
        stor.on('load', function (records, operation, success) {
            if (success) {
                me.addIslandsDistributionChart(tab);
            }
        },this,{single: true});
        if (l)
            stor.load();
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
                              },
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
