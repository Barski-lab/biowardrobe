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

Ext.define('EMS.controller.Preferences', {
    extend: 'Ext.app.Controller',

    models: ['Preferences'],
    stores: ['Preferences'],
    views: ['Preferences.Preferences'],

    localForm: {},

    init: function () {
        this.control
        ({
             'globalsettings': {
                 render: this.onPanelRendered
             },
             'globalsettings grid': {
                 selectionchange: this.onSelectionChange
             },
             'globalsettings button[itemId=change]': {
                 click: this.onChangeClick
             },
             'globalsettings textfield': {
                 change: this.onFieldsChange
             }
         });
    },
    onPanelRendered: function (form) {
        this.localForm = form;
        this.getPreferencesStore().load();
    },
    onSelectionChange: function(model, records) {
        var rec = records[0];
        this.localForm.getForm().loadRecord(rec);
        this.localForm.down('button#change').disable();
    },
    onChangeClick: function () {
        if (this.localForm.isValid()) {
            var record = this.egroupForm.getRecord();
            record.set(this.localForm.getValues());
            this.getPreferencesStore().sync();
            this.egroupForm.down('button#change').disable();
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }
    },
    onFieldsChange: function (field, newValue, oldValue, eOpts) {
        this.localForm.down('button#change').enable();
    }
});//Ext.define
