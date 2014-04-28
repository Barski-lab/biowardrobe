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

Ext.define('EMS.controller.Experiments', {
    extend: 'Ext.app.Controller',

    models: ['EGroup'],
    stores: ['EGroups'],
    views: ['Experiment.EGroup.EGroup'],

    egroupForm: {},

    init: function () {
        this.control
        ({
             'egrouplist': {
                 render: this.onEGroupPanelRendered
             },
             'egrouplist grid': {
                 selectionchange: this.onEGroupSelectionChange
             },
             'egrouplist button[itemId=change]': {
                 click: this.onEGroupChangeClick
             },
             'egrouplist button[itemId=add]': {
                 click: this.onEGroupAddClick
             },
             'egrouplist textfield': {
                 change: this.onEGroupFieldsChange
             }
         });
    },
    onEGroupPanelRendered: function (form) {
        this.egroupForm = form;
        this.getPreferencesStore().load();
    },
    onEGroupSelectionChange: function(model, records) {
        var rec = records[0];
        this.egroupForm.getForm().loadRecord(rec);
        this.egroupForm.down('button#change').disable();
    },
    onEGroupChangeClick: function () {

    },
    onEGroupAddClick: function () {

    },
    onEGroupFieldsChange: function (field, newValue, oldValue, eOpts) {
        this.egroupForm.down('button#change').enable();
    }
});//Ext.define
