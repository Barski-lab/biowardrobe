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

Ext.define('EMS.controller.Project.R', {
    extend: 'Ext.app.Controller',

    models: ['AdvancedR'],
    stores: ['AdvancedR'],

    views: [
        'Project2.RSrc'
    ],

    requires: [
        'EMS.util.Util'
    ],


    worker: {},
    save: false,

    init: function () {
        this.control
        ({
             'AdvancedRSrc button[text=apply]': {
                 click: this.onApply
             },
             'AdvancedRSrc #rscript': {
                 change: this.onScriptChange
             },
             'AdvancedRSrc #aceeditor': {
                 afterlayout: this.onEditorRender
             }

         });
    },//init

    /***********************************************************************
     ***********************************************************************/
    getSource: function () {
        var rscript = Ext.ComponentQuery.query('AdvancedRSrc #rscript')[0];//.getValue();
        var store=rscript.getStore();
        return store.findRecord('id', rscript.getValue(),0,false,true,true).get('rscript');
    },
    /***********************************************************************
     ***********************************************************************/
    setEditorValue: function () {
        var me = this,
                source = me.getSource();
        me.editorform.setValue(source);
    },
    /***********************************************************************
     ***********************************************************************/
    onScriptChange: function () {
        var me = this;
        me.setEditorValue();
    },


    /***********************************************************************
     ***********************************************************************/
    onEditorRender: function (form) {
        var me = this;
        me.editorform = form;
      //  me.setEditorValue();
    },

    /***********************************************************************
     ***********************************************************************/
    onApply: function (button) {
        var me = this;
        var rscript = Ext.ComponentQuery.query('AdvancedRSrc #rscript')[0];//.getValue();
        var nrscript = me.editorform.getValue();
        var store=rscript.getStore();
        var record=store.findRecord('id', rscript.getValue(),0,false,true,true);
        var orscript=record.set('rscript',nrscript);
        store.sync();
        //var store = this.getLabdataRStore();
        //store.getProxy().setExtraParam('codetype', combov);
        //var record = store.getAt(0);
        //record.set("rscript", rscript);
        //record.setDirty();
        //store.sync({
        //               callback: function () {
        //                   console.log('synced');
        //                   var maintabpanel = Ext.ComponentQuery.query('experimentR > tabpanel')[0];
        //                       maintabpanel.items.getAt(combov-1).getLoader().load();
        //                       maintabpanel.items.getAt(combov-1).update();
        //               }
        //           });

    },

    /***********************************************************************
     *
     ***********************************************************************/
    updatePanel: function (tab) {

    },

});//Ext.define
