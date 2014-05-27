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

Ext.define('EMS.controller.Experiment.Islands', {
    extend: 'Ext.app.Controller',

    models: ['Islands'],
    stores: ['Islands'],

    views: [
        'Experiment.Experiment.Islands'
    ],

    requires: [
        'EMS.util.Util'
    ],


    worker: {},
    save: false,

    init: function () {
        this.control
        ({
             'experimentislands checkboxfield': {
                 change: this.uniqIslands
             },
             'experimentislands button#browser-jump-islands': {
                 click: this.onBrowserJump
             },
             'experimentislands button#promoterapply': {
                 click: this.onApplyPromoter
             },
             'experimentislands button#islands-save': {
                 click: this.onIslandsSave
             }

         });
    },//init

    uniqIslands: function (check, val) {
        this.getIslandsStore().getProxy().setExtraParam('uniqislands', val);
        var pgbar = Ext.ComponentQuery.query('experimentislands pagingtoolbar')[0];
        pgbar.moveFirst();
    },
    /***********************************************************************
     ***********************************************************************/
    onBrowserJump: function (button) {
        var grid = Ext.ComponentQuery.query('experimentislands grid')[0];
        var model = grid.getSelectionModel().getSelection();
        if (model.length < 1) {
            return;
        }

        var start = model[0].data['start'],
                end = model[0].data['end'];
        var genomebrowser = Ext.ComponentQuery.query('experimentmainwindow #genomebrowser')[0];
        var url = genomebrowser.origUrl + '&position=' + model[0].data['chrom'] + ':' + start + "-" + end;

        var maintabpanel = Ext.ComponentQuery.query('experimentmainwindow > tabpanel')[0];
        maintabpanel.setActiveTab(genomebrowser);

        genomebrowser.load(url);

    },
    /***********************************************************************
     ***********************************************************************/
    onApplyPromoter: function (button) {
        var promoter = Ext.ComponentQuery.query('experimentislands #promoter')[0].getValue();
        this.getIslandsStore().load
        ({
             params: {
                 'promoter': promoter
             }
         });
    },
    /***********************************************************************
     ***********************************************************************/
    onIslandsSave: function (btn) {
        var form = btn.up('window').down('form').getForm();
        var record = form.getRecord();
        var tblname = record.data['uid'];
        window.location = "data/csv.php?tablename=" + tblname + "_islands";
    },


});//Ext.define
