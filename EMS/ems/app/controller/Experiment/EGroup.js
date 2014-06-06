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

Ext.define('EMS.controller.Experiment.EGroup', {
    extend: 'Ext.app.Controller',

    models: ['EGroup', 'Laboratory', 'Worker', 'EGroupRights'],
    stores: ['EGroups', 'Laboratories', 'Worker', 'EGroupRights'],
    views: ['Experiment.EGroup.EGroup'],

    requires: [
        'EMS.util.MessageBox'
    ],


    egroupForm: {},
    worker: {},

    init: function () {
        this.control
        ({
             'egrouplist': {
                 render: this.onEGroupPanelRendered,
                 destroy: this.onDestroy
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
             },
             'egrouplist combobox': {
                 select: this.onLabSelectFieldsChange
             },
             "egrouplist actioncolumn": {
                 itemclick: this.handleGrouplistActionColumn
             },
             'egrouprights grid': {
                 select: this.onEGroupRightsSelect,
                 deselect: this.onEGroupRightsDeselect
             }
         });
        this.EGroupsStore = Ext.create('EMS.store.EGroups', {storeId: Ext.id()});
        this.EGroupsStore.getProxy().setExtraParam('rights', true);
        this.EGroupsStore.load();

    },//init
    onDestroy: function () {
    },
    onEGroupPanelRendered: function (form) {
        this.egroupForm = form;
        this.worker = this.getWorkerStore().getAt(0);
        Ext.ComponentQuery.query('egrouplist grid')[0].bindStore(this.EGroupsStore);
        //this.getEGroupsStore().load();

        if (this.worker.data.isa) {
            Ext.ComponentQuery.query('egrouplist')[0].addDocked
            ({
                 xtype: 'toolbar',
                 ui: 'footer',
                 items: [
                     {
                         xtype: 'combobox',
                         tpl: '<tpl for="."><div class="x-boundlist-item" ><b>{name}</b><div style="display: block; text-align: justify; line-height:100%; font-size:80%; color: #449;"> {description}</div></div></tpl>',
                         labelWidth: 70,
                         minWidth: 400,
                         displayField: 'name',
                         fieldLabel: 'Laboratory',
                         valueField: 'id',
                         store: this.getLaboratoriesStore(),
                         queryMode: 'local',
                         forceSelection: true,
                         editable: false
                     }
                 ]
             }, 'top');
        }

        if (!this.worker.data.isa && !this.worker.data.isla) {
            this.egroupForm.down('button#change').disable();
            this.egroupForm.down('button#add').disable();
        }
    },
    /****************************
     *
     ****************************/
    onEGroupSelectionChange: function (model, records) {
        if (!this.worker.data.isa && !this.worker.data.isla)
            return;

        if (!records[0])
            return;

        Ext.ComponentQuery.query('egrouprights grid')[0].getSelectionModel().deselectAll(true);
        this.makeEGroupSelection();
        //        if (this.worker.data.isa)
        //            this.makeAdminSelection();
        //        else
        //            this.getEGroupRightsStore().load({
        //                                                 params: {
        //                                                     egroup_id: records[0].data['id']
        //                                                 }
        //                                             });

        //        this.egroupForm.getForm().reset();
        if (records[0]) { // --- bug does not work appropriately affects combobox
            this.egroupForm.getForm().loadRecord(records[0]);
        }
        this.egroupForm.down('button#change').disable();
    },

    makeEGroupSelection: function () {
        var lab_id;
        if (this.worker.data.isa)
            lab_id = Ext.ComponentQuery.query('egrouplist combobox')[0].getValue();
        var sel = Ext.ComponentQuery.query('egrouplist grid')[0].getSelectionModel().getSelection()[0];
        var id;
        if (sel)
            id = sel.data['id'];

        this.getEGroupRightsStore().load({
                                             params: {
                                                 egroup_id: id,
                                                 laboratory_id: lab_id
                                             }
                                         });
    },
    /****************************
     *
     ****************************/
    onEGroupChangeClick: function () {
        if (this.egroupForm.isValid()) {
            var record = this.egroupForm.getRecord();
            record.set(this.egroupForm.getValues());
            this.EGroupsStore.sync();
            this.egroupForm.down('button#change').disable();
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }
    },
    /****************************
     *
     ****************************/
    onEGroupAddClick: function () {
        var grid = this.egroupForm.down('grid'),
                store = grid.getStore(),
                modelName = store.getProxy().getModel().modelName;
        var id;
        if (!this.worker.data.isa && !this.worker.data.isla) {
            EMS.util.Util.showErrorMsg('Insufficient privileges');
            return;
        }

        if (this.egroupForm.isValid()) {
            if (this.worker.data.isa) {
                id = Ext.ComponentQuery.query('egrouplist combobox')[0].getValue();
            }
            if (id && id != '00000000-0000-0000-0000-000000000000') {
                store.insert(0, Ext.create(modelName, Ext.apply(this.egroupForm.getValues(), {laboratory_id: id})));
            } else {
                store.insert(0, Ext.create(modelName, Ext.apply(this.egroupForm.getValues())));
            }
            store.sync(function () {
                this.egroupForm.getForm().reset();
            });
            if (!this.worker.data.isa) {
                store.load();
            } else {
                store.load({
                               params: {
                                   laboratory_id: id
                               }
                           });
            }
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }

    },
    /****************************
     *
     ****************************/
    onEGroupFieldsChange: function (field, newValue, oldValue, eOpts) {
        if (this.worker.data.isa || this.worker.data.isla) {
            this.egroupForm.down('button#change').enable();
        }
    },
    /****************************
     *
     ****************************/
    onLabSelectFieldsChange: function (combo, records) {
        //        this.egroupForm.down('grid').getSelectionModel().deselectAll();
        //this.egroupForm.getForm().reset();
        this.EGroupsStore.load
        ({
             scope: this,
             params: {
                 laboratory_id: records[0].data['id']
             },
             callback: function () {
                 this.makeEGroupSelection();
             }
         });
    },

    /****************************
     *
     ****************************/
    handleGrouplistActionColumn: function (column, action, view, rowIndex, colIndex, item, e) {
        var me = this;
        if (action == 'delete') {
            var store = me.egroupForm.down('grid').getStore(),
                    rec = store.getAt(rowIndex);
            var lid;
            if (this.worker.data.isa)
                lid = Ext.ComponentQuery.query('egrouplist combobox')[0].getValue();

            Ext.create('EMS.util.MessageBox',
                       {
                           title: 'DELETE',
                           msg: 'Do you want to delete laboratory name "' + rec.data['name'] + '"?<br>You have to choose new group for the experiments!.',
                           fn: function (buttonId, combo) {
                               //console.log("fn", combo.getValue());
                               if (combo.getValue() === rec.data['id']) {
                                   return false;
                               }
                               var mvid = combo.getValue();
                               if (buttonId === "yes") {
                                   me.egroupForm.getForm().reset();
                                   me.makeEGroupSelection();
                                   store.remove(rec);
                                   store.getProxy().setExtraParam('moveto', mvid);
                                   store.sync({
                                                  callback: function () {
                                                      store.getProxy().setExtraParam('moveto', null);
                                                      if (me.worker.data.isa) {
                                                          Ext.ComponentQuery.query('egrouplist combobox')[0].setValue(lid);
                                                          store.load({
                                                                         params: {
                                                                             laboratory_id: lid
                                                                         }
                                                                     });
                                                      } else {
                                                          store.load();
                                                      }
                                                  }
                                              });
                               }
                           },
                           combobox: {
                               xtype: 'combobox',
                               tpl: '<tpl for="."><div class="x-boundlist-item" ><b>{name}</b><div style="display: block; text-align: justify; line-height:100%; font-size:80%; color: #449;"> {description}</div></div></tpl>',
                               labelWidth: 70,
                               minWidth: 200,
                               padding: 5,
                               displayField: 'name',
                               fieldLabel: '',
                               valueField: 'id',
                               queryMode: 'local',
                               forceSelection: true,
                               editable: false,
                               allowBlank: false,
                               store: this.EGroupsStore
                           }
                       }).show();
        }
    },
    /****************************
     *
     * Changing rights for an egroup
     *
     ****************************/
    onEGroupRightsSelect: function (rowmodel, record, index, eOpts) {
        if (index < 0) return;

        var lab_id = Ext.ComponentQuery.query('egrouplist grid')[0].getSelectionModel().getSelection()[0].data['id'];
        record.set('egroup_id', lab_id);
        this.getEGroupRightsStore().sync();
    },
    onEGroupRightsDeselect: function (rowmodel, record, index, eOpts) {
        if (index < 0) return;
        this.getEGroupRightsStore().remove(record);
        this.getEGroupRightsStore().sync();
        this.makeEGroupSelection();
        //this.getEGroupRightsStore().load();
    }
});//Ext.define
