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

Ext.define('EMS.controller.Experiment.RPKM', {
    extend: 'Ext.app.Controller',

    models: ['RPKM'],
    stores: ['RPKM'],

    views: [
        'Experiment.Experiment.RPKM'
    ],

    requires: [
        'EMS.util.Util'
    ],


    worker: {},
    save: false,

    init: function () {
        this.control
        ({
             'experimentrpkm button#browser-jump': {
                 click: this.onBrowserJump
             },
             'experimentrpkm button#rpkm-save': {
                 click: this.onRpkmSave
             },
             'experimentrpkm #rpkm-group-filter': {
                 select: this.onRpkmGroupFilter
             }

         });
    },//init

    /***********************************************************************
     ***********************************************************************/
    onBrowserJump: function (button) {
        var grid = Ext.ComponentQuery.query('experimentrpkm grid')[0];
        var model = grid.getSelectionModel().getSelection();
        if (model.length < 1) {
            return;
        }

        var start = model[0].data['txStart'],
                end = model[0].data['txEnd'];
        var genomebrowser = Ext.ComponentQuery.query('experimentmainwindow #genomebrowser')[0];
        var url = genomebrowser.origUrl + '&position=' + model[0].data['chrom'] + ':' + start + "-" + end;

        var maintabpanel = Ext.ComponentQuery.query('experimentmainwindow > tabpanel')[0];
        maintabpanel.setActiveTab(genomebrowser);

        genomebrowser.load(url);

    },
    /***********************************************************************
     ***********************************************************************/
    onRpkmSave: function (btn) {
        var form = btn.up('window').down('form').getForm();
        var record = form.getRecord();
        var tblname = record.data['uid'];
        var combo = Ext.ComponentQuery.query('experimentrpkm #rpkm-group-filter')[0]
        window.location = "data/csv.php?tablename=" + tblname + combo.value;
    },
    /***********************************************************************
     ***********************************************************************/
    onRpkmGroupFilter: function (combo, records, options) {
        var form = combo.up('window').down('form').getForm();
        var record = form.getRecord();
        var tblname = record.data['uid'];
        this.getRPKMStore().getProxy().setExtraParam('tablename', tblname + combo.value);
        this.getRPKMStore().load();
    },


});//Ext.define
