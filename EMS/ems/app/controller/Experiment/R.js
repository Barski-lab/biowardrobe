/****************************************************************************
 **
 ** Copyright (C) 2011-2015 Andrey Kartashov .
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

Ext.define('EMS.controller.Experiment.R', {
    extend: 'Ext.app.Controller',

    models: ['LabdataR'],
    stores: ['LabdataR'],

    views: [
        'Experiment.Experiment.R'
    ],

    requires: [
        'EMS.util.Util'
    ],


    worker: {},
    save: false,

    init: function () {
        this.control
        ({
             'experimentR button[text=apply]': {
                 click: this.onApply
             },
             'experimentR #codetype': {
                 change: this.onCodeTypeChange
             },
             'experimentR': {
                 afterrender: this.onTabRender
             },
             'experimentR #aceeditor': {
                 afterlayout: this.onEditorRender
             }

         });
    },//init

    /***********************************************************************
     ***********************************************************************/
    getSource: function () {
        var type = Ext.ComponentQuery.query('experimentR #codetype')[0].getValue();
        type = typeof type !== 'undefined' ? type : 1;

        var store = this.getLabdataRStore();

        store.getProxy().setExtraParam('codetype', type);
        store.getProxy().setExtraParam('UID', this.UID);

        store.load();
        return store;
    },
    /***********************************************************************
     ***********************************************************************/
    setEditorValue: function () {
        var me = this,
                store = me.getSource();
        store.on({
                     scope: me,
                     load: function (s, records) {
                         me.editorform.setValue(records[0].data.rscript);
                     }
                 });
    },
    /***********************************************************************
     ***********************************************************************/
    onCodeTypeChange: function () {
        var me = this;
        me.setEditorValue();
    },


    /***********************************************************************
     ***********************************************************************/
    onEditorRender: function (form) {
        var me = this;
        me.editorform = form;
        me.setEditorValue();
    },

    /***********************************************************************
     ***********************************************************************/
    onTabRender: function (form) {
        var me = this;
        this.UID = form.UID;
        var maintabpanel = Ext.ComponentQuery.query('experimentR > tabpanel')[0];
        maintabpanel.insert
        (0,{
            title: 'Default Result(s)',
            autoScroll: true,
            loader: {
                url: 'data/LabdataRShow.php?default=1&UID='+me.UID,
                loadMask: true
            },
        });
        maintabpanel.insert
        (1,{
            title: 'Custom Result(s)',
            autoScroll: true,
            loader: {
                url: 'data/LabdataRShow.php?default=0&UID='+me.UID,
                loadMask: true
            },
        });
        maintabpanel.setActiveTab(0);
        maintabpanel.items.getAt(0).getLoader().load();
        maintabpanel.items.getAt(0).update();
        maintabpanel.items.getAt(1).getLoader().load();
        maintabpanel.items.getAt(1).update();
    },
    /***********************************************************************
     ***********************************************************************/
    onApply: function (button) {
        var me = this;
        var combov = Ext.ComponentQuery.query('experimentR #codetype')[0].getValue();
        var rscript = me.editorform.getValue();

        var store = this.getLabdataRStore();
        store.getProxy().setExtraParam('codetype', combov);
        var record = store.getAt(0);
        record.set("rscript", rscript);
        record.setDirty();
        store.sync({
                       callback: function () {
                           console.log('synced');
                           var maintabpanel = Ext.ComponentQuery.query('experimentR > tabpanel')[0];
                           if(combov == 1) {
                               maintabpanel.items.getAt(0).getLoader().load();
                               maintabpanel.items.getAt(0).update();
                           } else {
                               maintabpanel.items.getAt(1).getLoader().load();
                               maintabpanel.items.getAt(1).update();
                           }
                       }
                   });

    },

    /***********************************************************************
     *
     ***********************************************************************/
    updatePanel: function (tab) {

    },

});//Ext.define
