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

Ext.require([
                'Ext.grid.*', 'Ext.data.*', 'Ext.ux.grid.FiltersFeature'
            ]);


Ext.define('EMS.controller.ExperimentsWindow', {
    extend: 'Ext.app.Controller',

    models: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],
    stores: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],
    views: ['EMS.view.ExperimentsWindow.Main', 'EMS.view.ExperimentsWindow.Grid', 'EMS.view.LabDataEdit.LabDataEditForm',
            'EMS.view.LabDataEdit.LabDataEdit', 'EMS.view.charts.Fence', 'EMS.view.LabDataEdit.LabDataDescription',
            'EMS.view.GenomeGroup.GenomeGroup', 'EMS.view.GenomeGroup.List', 'EMS.view.charts.ATP', 'EMS.view.charts.IslandsDistribution'],

    refresh: false,

    init: function () {
        this.control({
                         'ExperimentsWindow': {
                             show: this.onPanelRendered
                         },
                         'ExperimentsWindow grid': {
                             selectionchange: this.onSelectionChanged,
                             itemdblclick: this.onItemDblClick
                         },
                         '#new-experiment-data': {
                             click: this.onAdd
                         },
                         '#labdata-edit-save': {
                             click: this.onSave
                         },
                         'LabDataEdit': {
                             show: this.onEditShow,
                             close: this.onEditClose
                         },
                         'LabDataEdit combobox': {
                             select: this.onComboBoxSelect
                         },
                         '#labdata-grid-user-filter': {
                             select: this.onComboBoxSelectMakeFilter
                         },
                         '#browser-grp-edit': {
                             click: this.onBrowserGroupEdit
                         },
                         '#browser-jump': {
                             click: this.onBrowserJump
                         },
                         '#rpkm-save': {
                             click: this.onRpkmSave
                         },
                         '#rpkm-group-filter': {
                             select: this.onRpkmGroupFilter
                         },
                         '#browser-jump-islands': {
                             click: this.onBrowserJump
                         },
                         '#islands-save': {
                             click: this.onIslandsSave
                         }
                     });
    },
    //-----------------------------------------------------------------------
    // Disabling/enabling antibody and fragmentation in depend
    // of experiment type and genome on combobox select event
    //-----------------------------------------------------------------------
    onComboBoxSelect: function (combo, records, options) {
        if (combo.name === 'experimenttype_id') {
            this.setDisabledCombo(combo.up('window'));
        }
        if (combo.name === 'genome_id') {
            this.setVisibleSpike(combo.up('window'));
            var db = this.getGenomeStore().findRecord('id', combo.value, 0, false, false, true).data.db;
            this.genomeGroupStoreLoad(db);
        }

    },
    onComboBoxSelectMakeFilter: function (combo, records, options) {
        this.getLabDataStore().getProxy().setExtraParam('workerid', combo.value);
        Ext.getCmp('ExperimentsWindowGrid').m_PagingToolbar.moveFirst()
    },

    //-----------------------------------------------------------------------
    // Disabling/enabling antibody and fragmentation comboboxes
    //
    //-----------------------------------------------------------------------
    setDisabledCombo: function (obj) {
        var form = obj.down('form').getForm();
        var combo = form.findField('experimenttype_id');

        if (combo.getRawValue().indexOf('DNA') !== -1) {
            form.findField('crosslink_id').enable();
            form.findField('antibody_id').enable();
        } else {
            form.findField('crosslink_id').disable();
            form.findField('antibody_id').disable();
        }
    },
    //-----------------------------------------------------------------------
    // Disabling/enabling antibody and fragmentation comboboxes
    //
    //-----------------------------------------------------------------------
    setDisabledByStatus: function (obj, sts) {
        var form = obj.down('form').getForm();
        if (sts >= 1) {
            form.findField('url').setReadOnly(true);
            form.findField('download_id').setReadOnly(true);
        }
        if (sts >= 11) {
            form.findField('experimenttype_id').setReadOnly(true);
            form.findField('genome_id').setReadOnly(true);
            form.findField('name4browser').setReadOnly(true);
            form.findField('browsergrp').setReadOnly(true);
            Ext.getCmp('browser-grp-edit').disable();
        }
    },

    //-----------------------------------------------------------------------
    // Disabling/enabling spikeins field
    //
    //-----------------------------------------------------------------------
    setVisibleSpike: function (obj) {
        var form = obj.down('form').getForm();
        if (form.findField('genome_id').getRawValue().indexOf('spike') !== -1) {
            form.findField('spikeins_id').enable();
            form.findField('spikeinspool').enable();
        } else {
            form.findField('spikeins_id').disable();
            form.findField('spikeinspool').disable();
        }
    },
    //-----------------------------------------------------------------------
    //
    //
    //-----------------------------------------------------------------------
    genomeGroupStoreLoad: function (db, all) {
        this.getGenomeGroupStore().getProxy().setExtraParam('genomedb', db);
        all = (typeof all !== 'undefined') ? all : false;
        if (Rights.check(USER_ID, 'ExperimentsWindow') || all) {
            this.getGenomeGroupStore().getProxy().setExtraParam('genomenm', '');
        } else {
            this.getGenomeGroupStore().getProxy().setExtraParam('genomenm', USER_LNAME);
        }
        this.getGenomeGroupStore().load();
    },
    /***********************************************************************
     *
     * MAIN function which makes a behaviour of LabDataEdit Window
     *
     ***********************************************************************/
    onEditShow: function (obj) {
        obj.setWidth(1100);

        this.setVisibleSpike(obj);
        this.setDisabledCombo(obj);


        var maintabpanel = Ext.getCmp('labdataedit-main-tab-panel');
        var form = obj.down('form').getForm();
        var record = form.getRecord();
        var tblname = record.data['filename'].split(';')[0];
        var gdata = this.getGenomeStore().findRecord('id', record.data['genome_id'], 0, false, false, true).data;
        var spike = (gdata.genome.indexOf('spike') !== -1);
        var db = gdata.db;

        this.genomeGroupStoreLoad(db, parseInt(record.data['worker_id']) !== parseInt(USER_ID));

        var etype = this.getExperimentTypeStore().findRecord('id', record.data['experimenttype_id'], 0, false, false, true).data.etype;
        var isRNA = (etype.indexOf('RNA') !== -1);


        if (parseInt(record.data['worker_id']) !== parseInt(USER_ID) && !Rights.check(USER_ID, 'ExperimentsWindow')) {
            form.getFields().each(function (field) {
                field.setReadOnly(true);
            });
            Ext.getCmp('browser-grp-edit').disable();
            Ext.getCmp('labdata-edit-save').disable();
        }

        var sts = parseInt(record.data['libstatus']);
        var base = sts / 1000 | 0;
        sts = sts % 1000;
        this.setDisabledByStatus(obj, sts);

        if (sts <= 11) {
            form.findField('cells').focus(false, 100);
            for (var i = 1; i < maintabpanel.items.length; i++) {
                maintabpanel.items.getAt(i).setDisabled(true);
            }
            maintabpanel.setActiveTab(0);
            return;
        }

        if (sts > 11) {
            this.getFenceStore().load({ params: { recordid: record.raw['id'] } });
            maintabpanel.setActiveTab(1);

            var worker = this.getWorkerStore().findRecord('id', record.data['worker_id'], 0, false, false, true).data.worker.toUpperCase();

            var panelD = Ext.getCmp('experiment-description');
            panelD.tpl.overwrite(panelD.body, Ext.apply(record.data, {isRNA: isRNA, RNADNA: (isRNA) ? "RNA" : "DNA", worker: worker}));

            var gtbl = tblname;
            if (!isRNA) {
                gtbl = tblname + '_grp';
            }
            this.LabDataEdit.targetFrame.src = GENOME_BROWSER_IP + '/cgi-bin/hgTracks?db=' + db + '&pix=1050&refGene=full&' + gtbl + '=full';

            if (record.data['tagsribo'] > 0) {
                this.addPieChart(record, 'exp-chart', isRNA);
            }
        }//sts>11

        if (sts > 11 && !isRNA) {
            this.addIslandsList(maintabpanel, tblname);
            var anti = "";
            if (record.data.antibody_id > 1)
                anti=this.getAntibodiesStore().findRecord('id', record.data.antibody_id, 0, false, false, true).data.antibody;
            //anti = "";
            this.addATDPChart(maintabpanel, tblname, record.data.name4browser + " " + anti);
            this.addIslandsDistributionChart(maintabpanel, record.raw['id']);
        }//>11 and not RNA

        if (sts > 20 && isRNA) {
            this.addRPKMList(maintabpanel, tblname);
            if (spike) {
                this.addSpikeinChart(maintabpanel, record.raw['id']);
            }
        }

    },

    /***********************************************************************
     ***********************************************************************/
    onEditClose: function (obj) {
        if (this.refresh) {
            this.getLabDataStore().load();
            this.refresh = false;
        }
    },

    /***********************************************************************
     ***********************************************************************/
    onSelectionChanged: function () {
    },

    /***********************************************************************
     ***********************************************************************/
    onPanelRendered: function () {
        this.getLabDataStore().getProxy().setExtraParam('workerid', Ext.getCmp('labdata-grid-user-filter').getValue());
        Ext.getCmp('ExperimentsWindowGrid').m_PagingToolbar.moveFirst()
        this.getDownloadStore().load();
    },

    //-----------------------------------------------------------------------
    //
    // Set default values when new button pressed
    //-----------------------------------------------------------------------
    onAdd: function () {
        var edit = Ext.create('EMS.view.LabDataEdit.LabDataEdit', {addnew: true, modal: true});
        var r = Ext.create('EMS.model.LabData', {
            worker_id: USER_ID,
            fragmentsizeexp: 150,
            browsershare: false,
            genome_id: 1,
            crosslink_id: 1,
            fragmentation_id: 1,
            antibody_id: 'antibody-0000-0000-0000-000000000001',
            download_id: 1,
            spikeins_id: 1,
            experimenttype_id: 1,
            libstatustxt: 'new',
            dateadd: new Date()
        });
        edit.labDataForm.loadRecord(r);
        edit.labDataForm.on('render', function () {
            var panel = Ext.getCmp('labdataedit-main-tab-panel');
            for (var i = 1; i < panel.items.length; i++) {
                panel.items.getAt(i).setDisabled(true);
            }
            panel.setActiveTab(0);

            Ext.getCmp('big-bu-bum').on('render', function (form) {
                var protocolHTML = Ext.create('Ext.form.HtmlEditor', {
                    name: 'protocol',
                    hideLabel: true
                });
                form.add(protocolHTML);
            }, this, {single: true});

            Ext.getCmp('big-bu-bum2').on('render', function (form) {
                var protocolHTML = Ext.create('Ext.form.HtmlEditor', {
                    name: 'notes',
                    hideLabel: true
                });
                form.add(protocolHTML);
            }, this, {single: true});
        }, this, {single: true});
        edit.show();
        edit.down('form').getForm().findField('cells').focus(false, 100);

    },

    /***********************************************************************
     ***********************************************************************/
    onItemDblClick: function (grid, record) {
        this.LabDataEdit = Ext.create('EMS.view.LabDataEdit.LabDataEdit', {addnew: false, modal: true });
        this.LabDataEdit.labDataForm.loadRecord(record);
        var me = this;
        this.LabDataEdit.labDataForm.on('render', function () {

            Ext.getCmp('big-bu-bum').on('render', function (form) {
                var protocolHTML = Ext.create('Ext.form.HtmlEditor', {
                    name: 'protocol',
                    value: record.data.protocol,
                    hideLabel: true
                });
                form.add(protocolHTML);
            }, this, {single: true});

            Ext.getCmp('big-bu-bum2').on('render', function (form) {
                var protocolHTML = Ext.create('Ext.form.HtmlEditor', {
                    name: 'notes',
                    value: record.data.notes,
                    hideLabel: true
                });
                form.add(protocolHTML);
            }, this, {single: true});
        }, this, {single: true});
        this.LabDataEdit.show();
    },
    /***********************************************************************
     ***********************************************************************/
    onSave: function (button) {
        var win = button.up('window');
        var form = win.down('form');
        form.down("textfield[name=url]").enable();
        var record = form.getRecord();
        var values = form.getValues();
        var check = form.down("checkboxfield[name=browsershare]");
        var forcerun = form.down("checkboxfield[name=forcerun]");
        var fragmentsizeforceuse = form.down("checkboxfield[name=fragmentsizeforceuse]");
        var form = form.getForm();


        if (values['browsergrp'].length > 0 && this.getGenomeGroupStore().findRecord('name', values['browsergrp'], 0, false, false, true) === null) {
            Ext.Msg.show({
                             title: 'Save failed',
                             msg: 'Field "Browser group name" should be saved separately<br> press button at the right to edit',
                             icon: Ext.Msg.ERROR,
                             buttons: Ext.Msg.OK
                         });
            return;
        }

        if (win.addnew) {
            if (form.isValid()) {
                EMS.store.LabData.insert(0, values);
                this.refresh = true;
            } else {
                Ext.Msg.show({
                                 title: 'Save failed',
                                 msg: 'Empty fields are not allowed',
                                 icon: Ext.Msg.ERROR,
                                 buttons: Ext.Msg.OK
                             });
                return;
            }
        } else {
            if (form.isDirty() && form.isValid()) {
                Ext.apply(values, {browsershare: check.getValue(), forcerun: forcerun.getValue(), fragmentsizeforceuse: fragmentsizeforceuse.getValue()});
                record.set(values);
                this.refresh = true;
            } else if (!form.isValid()) {
                Ext.Msg.show({
                                 title: 'Save failed',
                                 msg: 'Please fill required filds',
                                 icon: Ext.Msg.ERROR,
                                 buttons: Ext.Msg.OK
                             });
                return;
            }
        }
        if (this.refresh) {
            this.getLabDataStore().sync();
        }
        win.close();
    },
    /***********************************************************************
     ***********************************************************************/
    onBrowserGroupEdit: function (button) {
        var edit = Ext.create('EMS.view.GenomeGroup.GenomeGroup', {addnew: true, modal: true});
        edit.show();
    },
    /***********************************************************************
     ***********************************************************************/
    onBrowserJump: function (button) {
        var grid = button.up('panel').down('grid');
        var model = grid.getSelectionModel().getSelection();
        if (model.length < 1) {
            return;
        }
        var form = button.up('window').down('form').getForm();
        var record = form.getRecord();
        var start = 0;
        var end = 0;
        if (typeof(model[0].data['start']) !== 'undefined') {
            start = model[0].data['start'];
            end = model[0].data['end'];
        }
        if (typeof(model[0].data['txStart']) !== 'undefined') {
            start = model[0].data['txStart'];
            end = model[0].data['txEnd'];
        }
        var tblname = record.data['filename'].split(';')[0];
        var maintabpanel = Ext.getCmp('labdataedit-main-tab-panel');
        var db = this.getGenomeStore().findRecord('id', record.data['genome_id'], 0, false, false, true).data.db;
        var etype = this.getExperimentTypeStore().findRecord('id', record.data['experimenttype_id'], 0, false, false, true).data.etype;
        if (etype.indexOf('DNA') !== -1) {
            tblname = tblname + '_grp';
        }
        maintabpanel.setActiveTab(2);
        var url = GENOME_BROWSER_IP + '/cgi-bin/hgTracks?db=' + db + '&pix=1050&refGene=full&' + tblname + '=full';
        url = url + '&position=' + model[0].data['chrom'] + ':' + start + "-" + end;
        this.LabDataEdit.targetFrame.load(url);
    },
    /***********************************************************************
     ***********************************************************************/
    onRpkmSave: function (btn) {
        var form = btn.up('window').down('form').getForm();
        var record = form.getRecord();
        var combo = Ext.getCmp('rpkm-group-filter');
        var tblname = record.data['filename'].split(';')[0];
        window.location = "data/csv.php?tablename=" + tblname + combo.value;
    },
    /***********************************************************************
     ***********************************************************************/
    onIslandsSave: function (btn) {
        var form = btn.up('window').down('form').getForm();
        var record = form.getRecord();
        var tblname = record.data['filename'].split(';')[0];
        window.location = "data/csv.php?tablename=" + tblname + "_macs";
    },
    /***********************************************************************
     ***********************************************************************/
    onRpkmGroupFilter: function (combo, records, options) {
        var form = combo.up('window').down('form').getForm();
        var record = form.getRecord();
        var tblname = record.raw['filename'].split(';')[0];
        this.getRPKMStore().getProxy().setExtraParam('tablename', tblname + combo.value);
        this.getRPKMStore().load();
    },

    /***********************************************************************
     ***********************************************************************/
    addPieChart: function (record, renderto, isRNA) {
        var others = 100.0 - record.data['tagspercent'] - record.data['tagsribopercent'];
        var store = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            fields: [
                'name', {name: 'percent', type: 'float'}
            ],
            data: [
                ['Mapped', record.data['tagspercent']],
                [isRNA ? 'Ribosomal' : 'Suppresed', record.data['tagsribopercent']],
                ['Mismatch', others.toFixed(2)]
            ]
        });

        Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            animate: false,
            renderTo: renderto,
            height: 110,
            width: 110,
            padding: 0,
            margin: 0,
            store: store,
            shadow: false,
            border: false,
            plain: true,
            layout: 'fit',
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
                        font: '9px Arial'
                    }
                }
            ]
        });

    },
    /*
     * Add Tab functions
     */
    /***********************************************************************
     ***********************************************************************/
    addATDPChart: function (tab, tblname, bn) {
        var stor = this.getATDPChartStore();
        stor.getProxy().setExtraParam('tablename', tblname + '_atp');
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
                              var ATDPChart = Ext.create("EMS.view.LabDataEdit.ATPChart", {LEN: len, MAX: max, PRC: prc, BNAME: bn});
                              tab.add(ATDPChart);
                          }
                      }
                  });
    },
    /***********************************************************************
     ***********************************************************************/
    addIslandsList: function (tab, tblname) {
        var stor = this.getIslandsStore();
        stor.getProxy().setExtraParam('tablename', tblname + '_macs');
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              var Islandstab = Ext.create("EMS.view.LabDataEdit.LabDataIslands");
                              tab.add(Islandstab);
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
});
