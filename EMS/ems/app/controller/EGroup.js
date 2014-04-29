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

Ext.define('EMS.controller.EGroup', {
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

         });
    },//init
    onDestroy: function () {
    },
    onEGroupPanelRendered: function (form) {
        this.egroupForm = form;
        this.worker = this.getWorkerStore().getAt(0);

        this.getEGroupsStore().load();

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

        if (this.worker.data.isa)
            this.makeAdminSelection();
        else
            this.getEGroupRightsStore().load({
                                                 params: {
                                                     egroup_id: records[0].data['id']
                                                 }
                                             });

//        this.egroupForm.getForm().reset();
        if (records[0]) { // --- bug does not work appropriatly affects combobox
            this.egroupForm.getForm().loadRecord(records[0]);
        }
        this.egroupForm.down('button#change').disable();
    },

    makeAdminSelection: function () {
        var id = Ext.ComponentQuery.query('egrouplist combobox')[0].getValue();
        var lab_id = Ext.ComponentQuery.query('egrouplist grid')[0].getSelectionModel().getSelection()[0].data['id'];
        console.log(lab_id);
        console.log(id);
        if (id && lab_id)
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
            this.getEGroupsStore().sync();
            this.egroupForm.down('button#change').disable();
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }
    },
    /****************************
     *
     ****************************/
    onEGroupAddClick: function () {

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
        this.getEGroupsStore().load
        ({
             params: {
                 laboratory: records[0].data['id']
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
            Ext.create('EMS.util.MessageBox',
                       {
                           title: 'DELETE',
                           msg: 'Do you want to delete laboratory name "' + rec.data['name'] + '"?<br>You have to choose new group for the experiments!.',
                           fn: function (buttonId, combo) {
                               //console.log("fn", combo.getValue());
                               if(combo.getValue()===rec.data['id']) {
                                   return false;
                               }
                               var mvid = combo.getValue();
                               if (buttonId === "yes") {
                                   me.egroupForm.getForm().reset();
                                   me.getEGroupRightsStore().load();
                                   store.remove(rec);
                                   store.getProxy().setExtraParam('moveto', mvid);
                                   store.sync({
                                                  callback: function () {
                                                      store.load();
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
                               store: this.getEGroupsStore()
                           }
                       }).show();
        }
    }
});//Ext.define
