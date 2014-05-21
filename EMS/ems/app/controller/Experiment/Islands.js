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

    //    models: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
    //             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],
    //    stores: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
    //             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],

    models: ['EGroup', 'Laboratory', 'Worker', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome', 'Download', 'Fence', 'Fragmentation', 'ATDPChart','Islands'],
    stores: ['EGroups', 'Laboratories', 'Worker', 'Workers', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome', 'Download', 'Fence', 'Fragmentation', 'ATDPChart','Islands'],

    views: ['Experiment.Experiment.MainWindow',
            'Experiment.Experiment.EditForm',
            'Experiment.Experiment.QualityControl',
            'Experiment.Experiment.Islands',
    ],

    requires: [
        'EMS.util.Util'
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
    },//init
    /****************************
     * Init window functions
     ****************************/
    onDestroy: function () {
        this.ATDPChart.destroy();
    },
    onClose: function () {
        if (!this.save)
            Ext.ComponentQuery.query('experimenteditform')[0].getRecord().store.rejectChanges();
        this.save = false;
    },
    onWindowRendered: function (form) {
        var me = this;
        this.worker = this.getWorkerStore().getAt(0);
        this.getDownloadStore().load();
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

        this.UID = record.data['uid'];
        this.tblname = record.data['filename'].split(';')[0];
        var gdata = this.getGenomeStore().findRecord('id', record.data['genome_id'], 0, false, false, true).data;
        this.spike = (gdata.genome.indexOf('spike') !== -1);
        this.db = gdata.db;

        this.isRNA = ((Ext.ComponentQuery.query('experimenteditform combobox[name=experimenttype_id]')[0]).getRawValue().indexOf('RNA') !== -1);


        if (this.worker.data['laboratory_id'] != record.data['laboratory_id'] && !this.worker.data.isa && !this.worker.data.isla)
            this.readOnlyAll(form);


        var sts = parseInt(record.data['libstatus']);
        var base = sts / 1000 | 0;
        sts = sts % 1000;

        form.findField('cells').focus(false, 400);

        if ((sts < 11 && base == 0) || sts < 10)
            form.findField('forcerun').hide();

        if (sts < 11)
            return;

        if (!this.worker.data.isa && !this.worker.data.isla)
            this.setDisabledByStatus(sts);

        this.addQC(maintabpanel, record);
        this.addGB(maintabpanel);

        if (sts > 11 && !this.isRNA) {
            var anti = "";
            //            if (record.data.antibody_id > 1)
            //                anti=this.getAntibodiesStore().findRecord('id', record.data.antibody_id, 0, false, false, true).data.antibody;
            //            //anti = "";
            this.addIslandsList(maintabpanel);
            this.addATDPChart(maintabpanel, record.data.name4browser + " " + anti);
            //            this.addIslandsDistributionChart(maintabpanel, record.raw['id']);
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
                 }});
            this.save = true;
        }
        Ext.ComponentQuery.query('experimentmainwindow')[0].close();
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
        if (sts >= 11) {
            form.findField('experimenttype_id').setReadOnly(true);
            form.findField('genome_id').setReadOnly(true);
            form.findField('name4browser').setReadOnly(true);
            form.findField('egroup_id').setReadOnly(true);
            form.findField('fragmentation_id').setReadOnly(true);
            form.findField('crosslink_id').setReadOnly(true);
            form.findField('antibody_id').setReadOnly(true);
            form.findField('antibodycode').setReadOnly(true);
            form.findField('spikeins_id').setReadOnly(true);
            form.findField('dateadd').setReadOnly(true);
            form.findField('cells').setReadOnly(true);
            form.findField('conditions').setReadOnly(true);
            form.findField('groupping').setReadOnly(true);
            form.findField('protocol').setReadOnly(true);
            form.findField('notes').setReadOnly(true);
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
        this.getFenceStore().load({ params: { recordid: record.get('id') } });

        tab.add({
                    xtype: 'experimentqualitycontrol',
                    iconCls: 'chart'
                });
        var panelD = Ext.ComponentQuery.query('experimentqualitycontrol panel#experiment-description')[0];
        panelD.on('afterrender', function () {
            panelD.tpl.overwrite(panelD.body, Ext.apply(record.data, {isRNA: this.isRNA, }));


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

        var gtbl = this.tblname;
        if (!this.isRNA) {
            gtbl = this.tblname + '_grp';
        }

        //#FIXIT
        var url = 'https://gbinternal/cgi-bin/hgTracks?db=' + this.db + '&pix=1050&refGene=full&' + gtbl + '=full';
        tab.add({
                    title: 'Genome browser',
                    iconCls: 'genome-browser',
                    xtype: 'uxiframe',
                    src: url
                });
    },
    /***********************************************************************
     * Add average tag density profile tab
     ***********************************************************************/
    addATDPChart: function (tab, bn) {
        var stor = this.getATDPChartStore();
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
                              var prc = Math.abs(parseInt(max.toString().split('e')[1])) + 2;
                              this.ATDPChart = Ext.create("EMS.view.Experiment.Experiment.ATPChart", {LEN: len, MAX: max, PRC: prc, BNAME: bn});
                              tab.add(this.ATDPChart);
                          }
                      }
                  });
    },
    /***********************************************************************
     ***********************************************************************/
    addIslandsList: function (tab) {
        var stor = this.getIslandsStore();
        stor.getProxy().setExtraParam('tablename', this.UID + '_islands');
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              //var Islandstab = Ext.create("EMS.view.Experiment.Experiment.Islands");
                              tab.add({
                                          xtype: 'experimentislands'
                                      });
                          }
                      }
                  });
    },
    /***********************************************************************
     ***********************************************************************/
    addRPKMList: function (tab, tblname) {
        var stor = this.getRPKMStore();
        stor.getProxy().setExtraParam('tablename', tblname + '_genes');
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              tab.add(Ext.create("EMS.view.LabDataEdit.LabDataRPKM"));
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
    addIslandsDistributionChart: function (tab, lid) {
        var stor = this.getIslandsDistributionStore();
        stor.getProxy().setExtraParam('labdata_id', lid);
        stor.load({
                      callback: function (records, operation, success) {
                          var IslandsDistributionChart = Ext.create("EMS.view.LabDataEdit.IslandsDistribution");
                          tab.add(IslandsDistributionChart);
                      }
                  });
    }


});//Ext.define
