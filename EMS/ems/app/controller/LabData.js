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

    models: ['EGroup', 'Laboratory', 'Worker', 'EGroupRights','LabData','ExperimentType','Genome', 'Antibodies', 'Crosslinking', 'Fragmentation'],

    stores: ['EGroups', 'Laboratories', 'Worker', 'EGroupRights','LabData','ExperimentType','Genome', 'Antibodies', 'Crosslinking', 'Fragmentation'],

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
//                 selectionchange: this.onEGroupSelectionChange
             },
             'experimentlistwindow button[itemId=add]': {
                 click: this.onExperimentAddClick
             },
             'experimentlistwindow combobox': {
                 select: this.onLabSelectFieldsChange
             },
             "experimentlistwindow actioncolumn": {
                 itemclick: this.handleLabDataActionColumn
             },

         });
    },//init
    onDestroy: function () {
    },
    onPanelRendered: function (form) {
        var me=this;
        this.worker = this.getWorkerStore().getAt(0);
        this.getExperimentTypeStore().load();
        this.getGenomeStore().load();
        this.getEGroupsStore().load();
        this.getLaboratoriesStore().load(function() {
            Ext.ComponentQuery.query('experimentlistwindow combobox')[0].setValue(me.worker.data['laboratory_id']);
        });
        this.getLabDataStore().load();

    },
//    /****************************
//     *
//     ****************************/
//    onEGroupSelectionChange: function (model, records) {
//        if (!this.worker.data.isa && !this.worker.data.isla)
//            return;
//
//        if (!records[0])
//            return;
//
//        Ext.ComponentQuery.query('egrouprights grid')[0].getSelectionModel().deselectAll(true);
//
//        if (this.worker.data.isa)
//            this.makeAdminSelection();
//        else
//            this.getEGroupRightsStore().load({
//                                                 params: {
//                                                     egroup_id: records[0].data['id']
//                                                 }
//                                             });
//
//        this.egroupForm.getForm().reset();
//        if (records[0]) { // --- bug does not work appropriatly affects combobox
//            this.egroupForm.getForm().loadRecord(records[0]);
//        }
//        this.egroupForm.down('button#change').disable();
//    },

    /****************************
     *
     ****************************/
    onExperimentAddClick: function () {

    },
    /****************************
     *
     ****************************/
    onLabSelectFieldsChange: function (combo, records) {
//        //        this.egroupForm.down('grid').getSelectionModel().deselectAll();
//        this.egroupForm.getForm().reset();
//        this.getEGroupsStore().load
//        ({
//             params: {
//                 laboratory: records[0].data['id']
//             }
//         });
    },

    /****************************
     *
     ****************************/
    handleLabDataActionColumn: function (column, action, view, rowIndex, colIndex, item, e) {
        var me = this;
        if (action == 'delete') {
//            var store = me.egroupForm.down('grid').getStore(),
//                    rec = store.getAt(rowIndex);
        }
    }
});//Ext.define
