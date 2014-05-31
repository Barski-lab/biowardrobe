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

Ext.define('EMS.controller.Info', {
    extend: 'Ext.app.Controller',
    stores: ['Info', 'Worker'],
    models: ['Info', 'Worker'],
    views: ['Info.Supplemental'],

    init: function () {
        var me = this;
        me.control({
                       'infosupplemental #save-supplemental-info': {
                           click: me.update
                       },
                       'infosupplemental': {
                           render: me.onRender
                       }

                   });
    },
    onRender: function (view) {

        var me = this;
        this.worker = this.getWorkerStore().getAt(0);

        var store = me.getInfoStore();
        store.getProxy().setExtraParam('id', 1);
        store.load();
        store.on('load', function () {
            if (!this.worker.data.isa) {
                view.down('form').add
                ({
                     xtype: 'panel',
                     autoScroll: true,
                     overflowY: 'scroll',
                     html: store.getAt(0).data['info']
                 });
                console.log(store.getAt(0).data);
                Ext.ComponentQuery.query('infosupplemental #save-supplemental-info')[0].hide();
            } else {
                view.down('form').add
                ({
                     xtype: 'htmleditor',
                     name: 'info',
                     hideLabel: true
                 });
                view.down('form').loadRecord(store.getAt(0));
            }

        }, this, { single: true });

    },

    update: function (button) {
        var me = this;
        var win = button.up('window');
        var form = win.down('form');
        var record = form.getRecord();
        var values = form.getValues();

        if (form.getForm().isValid()) {
            record.set(values);
            var store = me.getInfoStore();
            store.on('datachanged', function (thestore, eopts) {
                win.close();
            }, this, { single: true });
            store.sync();
        }
    }
});
