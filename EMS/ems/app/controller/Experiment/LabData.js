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

Ext.define('EMS.controller.LabData', {
    extend: 'Ext.app.Controller',

    //    models: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
    //             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],
    //    stores: ['LabData', 'ExperimentType', 'Worker', 'Genome', 'Antibodies', 'Crosslinking', 'Fragmentation', 'Fence',
    //             'GenomeGroup', 'RPKM', 'Islands', 'SpikeinsChart', 'Spikeins', 'ATDPChart', 'IslandsDistribution', 'Download'],

    models: ['EGroup', 'Laboratory', 'Worker', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome'],

    stores: ['EGroups', 'Laboratories', 'Worker', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome'],

    views: ['Experiment.EGroup.EGroup'],

    requires: [
        //        'EMS.util.MessageBox'
    ],


    worker: {},

    init: function () {
        this.control
        ({
             'experimentlistwindow': {
                 render: this.onPanelRendered,
                 destroy: this.onDestroy
             },
             'experimentlistwindow grid': {
                 itemdblclick: this.onExperimentShow
             },
             'experimentlistwindow button[itemId=add]': {
                 click: this.onExperimentAddClick
             },
             'experimentlistwindow combobox#laboratories': {
                 select: this.onLaboratoriesChange
             },
             'experimentlistwindow combobox#projects': {
                 select: this.onProjectsChange
             },
             "experimentlistwindow actioncolumn": {
                 itemclick: this.handleLabDataActionColumn
             }
         });
    },//init
    onDestroy: function () {
    },
    onPanelRendered: function (form) {
        var me = this;
        this.worker = this.getWorkerStore().getAt(0);
        this.getExperimentTypeStore().load();
        this.getGenomeStore().load();
        this.getEGroupsStore().load();
        this.getLaboratoriesStore().load(function () {
            Ext.ComponentQuery.query('experimentlistwindow combobox')[0].setValue(me.worker.data['laboratory_id']);
            me.reloadLabData();
        });
    },

    /****************************
     *
     ****************************/
    onExperimentAddClick: function () {

    },
    /****************************
     *
     ****************************/
    reloadLabData: function () {
        var me=this;
        this.getLabDataStore().getProxy().setExtraParam('laboratory_id', Ext.ComponentQuery.query('experimentlistwindow combobox#laboratories')[0].getValue());
        this.getLabDataStore().getProxy().setExtraParam('egroup_id', Ext.ComponentQuery.query('experimentlistwindow combobox#projects')[0].getValue());
        var pgbar=Ext.ComponentQuery.query('experimentlistwindow pagingtoolbar')[0];
        pgbar.moveFirst();
    },
    /****************************
     *
     ****************************/
    onLaboratoriesChange: function (combo, records) {
        this.reloadLabData();
    },
    /****************************
     *
     ****************************/
    onProjectsChange: function (combo, records) {
        this.reloadLabData();
    },

    /****************************
     *
     ****************************/
    handleLabDataActionColumn: function (column, action, view, rowIndex, colIndex, item, e, record) {
        var me = this;
        if (action == 'delete') {
            //            var store = me.egroupForm.down('grid').getStore(),
            //                    rec = store.getAt(rowIndex);
        }
        if (action == 'view') {
            this.onExperimentShow(view, record);
        }
        if (action == 'duplicate') {
            this.duplicateRecord(view, rowIndex, colIndex, item, e, record);
        }
    },
    /****************************
     *
     ****************************/
    duplicateRecord: function (view, rowIndex, colIndex, item, e) {
        var store = view.getStore();
        var data = store.getAt(rowIndex).data;
        var worker = Ext.getStore('Worker').getAt(0);
        var r = Ext.create('EMS.model.LabData', {
            worker_id: worker.data['id'],
            author: worker.data['fullname'],
            fragmentsizeexp: 150,
            browsershare: false,
            genome_id: data['genome_id'],
            crosslink_id: data['crosslink_id'],
            fragmentation_id: data['fragmentation_id'],
            antibody_id: data['antibody_id'],
            antibodycode: data['antibodycode'],
            experimenttype_id: data['experimenttype_id'],
            cells: data['cells'],
            conditions: data['conditions'],
            spikeinspool: data['spikeinspool'],
            spikeins: data['spikeins'],
            notes: data['notes'],
            protocol: data['protocol'],
            browsergrp: data['browsergrp'],
            libstatus: 0,
            libstatustxt: 'new',
            dateadd: data['dateadd']
        });
        store.insert(rowIndex + 1, r);
    },
    /****************************
     *
     ****************************/
    onExperimentShow: function (grid, record) {
        var me = this;
        me.LabDataEdit = Ext.create('EMS.view.Experiment.LabDataEdit.LabDataWindow', {addnew: false, modal: true });
        me.LabDataEdit.down('labdataform').getForm().loadRecord(record);
        //        this.LabDataEdit.labDataForm.on('render', function () {
        //
        //            Ext.ComponentQuery.query('labdatawindow pagingtoolbar')[0].on('render', function (form) {
        //                var protocolHTML = Ext.create('Ext.form.HtmlEditor', {
        //                    name: 'protocol',
        //                    value: record.data.protocol,
        //                    hideLabel: true
        //                });
        //                form.add(protocolHTML);
        //            }, this, {single: true});
        //
        //            Ext.getCmp('big-bu-bum2').on('render', function (form) {
        //                var protocolHTML = Ext.create('Ext.form.HtmlEditor', {
        //                    name: 'notes',
        //                    value: record.data.notes,
        //                    hideLabel: true
        //                });
        //                form.add(protocolHTML);
        //            }, this, {single: true});
        //        }, this, {single: true});
        this.LabDataEdit.show();
    },

});//Ext.define
