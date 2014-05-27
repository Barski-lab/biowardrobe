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

Ext.define('EMS.controller.Experiment.LabData', {
    extend: 'Ext.app.Controller',

    models: ['EGroup', 'Laboratory', 'Worker', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome'],

    stores: ['EGroups', 'Laboratories', 'Worker', 'EGroupRights', 'LabData', 'ExperimentType', 'Genome'],

    views: ['Experiment.LabData.LabDataListWindow'],

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
             'experimentlistwindow button#newexperiment': {
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
    reloadLabData: function () {
        var me = this;
        this.getLabDataStore().getProxy().setExtraParam('laboratory_id', Ext.ComponentQuery.query('experimentlistwindow combobox#laboratories')[0].getValue());
        this.getLabDataStore().getProxy().setExtraParam('egroup_id', Ext.ComponentQuery.query('experimentlistwindow combobox#projects')[0].getValue());
        var pgbar = Ext.ComponentQuery.query('experimentlistwindow pagingtoolbar')[0];
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
            var store = view.getStore(),
                    rec = store.getAt(rowIndex);
            var sts = rec.get('libstatus');
            sts = sts % 1000;
            if (sts > 1) {
                Ext.MessageBox.show
                ({
                     title: 'DELETE',
                     msg: 'Do you want to delete "' + rec.get('name4browser') + '"?<br> All relaited data (plots/analyses/gene lists/etc)<br>will be deleted from the system also! ',
                     icon: Ext.MessageBox.QUESTION,
                     fn: function (buttonId) {
                         if (buttonId === "yes") {
                             store.remove(rec);
                             store.sync
                             ({
                                  callback: function () {
                                      store.load();
                                  }
                              });
                         }
                     },
                     buttons: Ext.Msg.YESNO
                 });
            } else {
                store.remove(rec);
                store.sync
                ({
                     callback: function () {
                         store.load();
                     }
                 });
            }
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
    onExperimentAddClick: function (button) {
        var store = this.getLabDataStore();
        var r = Ext.create('EMS.model.LabData', {
            worker_id: this.worker.data['id'],
            author: this.worker.data['fullname'],
            fragmentsizeexp: 150,
            browsershare: false,
            genome_id: 1,
            crosslink_id: 1,
            fragmentation_id: 1,
            antibody_id: 'antibody-0000-0000-0000-000000000001',
            experimenttype_id: 1,
            spikeins: 1,
            libstatus: 0,
            libstatustxt: 'new',
            download_id: 1,
            dateadd: new Date()
        });
        store.insert(0, r);
        this.onExperimentShow(button, r);
    },
    /****************************
     *
     ****************************/
    duplicateRecord: function (view, rowIndex, colIndex, item, e) {
        var store = view.getStore();
        var data = store.getAt(rowIndex).data;
        var r = Ext.create('EMS.model.LabData', {
            worker_id: this.worker.data['id'],
            author: this.worker.data['fullname'],
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
            download_id: data['download_id'],
            notes: data['notes'],
            protocol: data['protocol'],
            egroup_id: data['egroup_id'],
            libstatus: 0,
            libstatustxt: 'new',
            dateadd: data['dateadd']
        });
        store.insert(rowIndex + 1, r);
        this.onExperimentShow(view, r);
    },
    /****************************
     *
     ****************************/
    onExperimentShow: function (grid, record) {
        //var me = this;
        var LabDataEdit = Ext.create('EMS.view.Experiment.Experiment.MainWindow', {modal: true });
        LabDataEdit.down('experimenteditform').getForm().loadRecord(record);
        LabDataEdit.show();
        LabDataEdit.focus(false, 400);
    },

});//Ext.define
