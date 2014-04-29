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

Ext.define('EMS.controller.UsersGroups', {
    extend: 'Ext.app.Controller',
    stores: ['Worker', 'Workers', 'Laboratories'],
    models: ['Worker', 'Laboratory'],
    views: ['user.UsersGroups', 'user.Users', 'user.Groups'],

    worker: {},
    groupForm: {},
    userForm: {},

    init: function () {
        this.control
        ({
             'groupsedit': {
                 render: this.onGroupsRender
             },
             'groupsedit grid': {
                 selectionchange: this.onGroupSelectionChange
             },
             'groupsedit button[itemId=add]': {
                 click: this.onGroupsAddClick
             },
             'groupsedit button[itemId=change]': {
                 click: this.onGroupsChangeClick
             },
             'groupsedit textfield': {
                 change: this.onGroupsFieldsChange
             },
             "groupsedit actioncolumn": {
                 itemclick: this.handleGroupsActionColumn
             },


             'usersedit': {
                 render: this.onUsersRender
             },
             'usersedit grid': {
                 selectionchange: this.onUserSelectionChange
             },
             'usersedit button[itemId=add]': {
                 click: this.onUsersAddClick
             },
             'usersedit button[itemId=change]': {
                 click: this.onUsersChangeClick
             },
             'usersedit textfield': {
                 change: this.onUsersFieldsChange
             },
             'usersedit checkbox': {
                 change: this.onUsersFieldsChange
             },
             "usersedit actioncolumn": {
                 itemclick: this.handleUsersActionColumn
             },

             //             'WorkersEdit > grid': {
             //                 itemdblclick: this.gridedit
             //             },
             //             '#worker-edit-save': {
             //                 click: this.update
             //             },
             //             '#new-worker-window': {
             //                 click: this.newworkerwin
             //             }
         });
        this.worker = this.getWorkerStore().getAt(0);
        this.getLaboratoriesStore().load();
        this.getWorkersStore().load();
    },
    /*********************************
     *
     *  Group Functions
     *
     **********************************/
    onGroupsRender: function (form) {
        this.groupForm = form;
        this.groupForm.down('button#change').disable();
        if (!this.worker.data.isa)
            this.groupForm.down('button#add').disable();
        this.groupForm.down('grid').getSelectionModel().select(0);
    },
    /*********************************
     * Fills up group edit form on grid select
     **********************************/
    onGroupSelectionChange: function (model, records) {
        var rec = records[0];
        if (rec && this.groupForm && rec.data['id'] != '00000000-0000-0000-0000-000000000000' && rec.data['id'] != 'laborato-ry00-0000-0000-000000000001') {
            this.groupForm.getForm().loadRecord(rec);
        } else {
            this.groupForm.getForm().reset();
        }
        this.groupForm.down('button#change').disable();
        if (this.worker.data.isa)
            this.getWorkersStore().load
            ({
                 params: {
                     laboratory: rec.data['id']
                 }
             });
    },
    /*********************************
     * Fires when add button cliked
     **********************************/
    onGroupsAddClick: function (button) {
        var grid = this.groupForm.down('grid'),
                store = grid.getStore(),
                modelName = store.getProxy().getModel().modelName,
                groupForm=this.groupForm;
        if (this.groupForm.isValid()) {
            store.insert(0, Ext.create(modelName, this.groupForm.getValues()));
            this.getLaboratoriesStore().sync(function(){
                groupForm.getForm().reset();
            });
            this.getLaboratoriesStore().load();
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }
    },
    /*********************************
     *Fires when change button cliked
     **********************************/
    onGroupsChangeClick: function () {
        if (this.groupForm.isValid()) {
            var record = this.groupForm.getRecord();
            record.set(this.groupForm.getValues());
            this.getLaboratoriesStore().sync();
//            this.getLaboratoriesStore().load();
            this.groupForm.down('button#change').disable();
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }
    },
    /*********************************
     *Fires when fields changed
     **********************************/
    onGroupsFieldsChange: function (field, newValue, oldValue, eOpts) {
        var rec = this.groupForm.down('grid').getSelectionModel().getSelection()[0];
        if (rec.data['id'] != '00000000-0000-0000-0000-000000000000' && rec.data['id'] != 'laborato-ry00-0000-0000-000000000001')
            this.groupForm.down('button#change').enable();
    },
    /*********************************
     * Groups delete record
     **********************************/
    handleGroupsActionColumn: function (column, action, view, rowIndex, colIndex, item, e) {
        var me = this;
        if (action == 'delete') {
            var store = me.groupForm.down('grid').getStore(),
                    rec = store.getAt(rowIndex);
            Ext.MessageBox.show
            ({
                 title: 'DELETE',
                 msg: 'Do you want to delete laboratory name "' + rec.data['name'] + '"',
                 icon: Ext.MessageBox.QUESTION,
                 fn: function (buttonId) {
                     if (buttonId === "yes") {
                         me.groupForm.getForm().reset();
                         store.remove(rec);
                         store.sync({
                                        callback: function () {
                                            store.load();
                                        }
                                    });
                     }
                 },
                 buttons: Ext.Msg.YESNO
             });
        }
    },
    /*********************************
     *
     *
     * USERS FUNCTIONS
     *
     *
     **********************************/


    /*********************************
     *
     **********************************/
    onUsersRender: function (form) {
        this.userForm = form;
        this.userForm.down('button#change').disable();
        //        this.userForm.down('grid').getSelectionModel().select(0);
    },
    /*********************************
     * Fills up user edit form on grid select
     **********************************/
    onUserSelectionChange: function (model, records) {
        //var form = Ext.ComponentQuery.query('UsersGroups groupsedit')[0];
        var rec = records[0];
        if (rec && this.userForm && !(rec.data['laboratory_id'] == 'laborato-ry00-0000-0000-000000000001' && rec.data['worker'] == 'admin')) {
            this.userForm.getForm().loadRecord(rec);
        } else {
            this.userForm.getForm().reset();
        }
        this.userForm.down('button#change').disable();
    },
    /*********************************
     * Fires when add button cliked
     **********************************/
    onUsersAddClick: function (button) {
        var grid = this.userForm.down('grid'),
                store = grid.getStore(),
                modelName = store.getProxy().getModel().modelName;
        if (this.userForm.isValid()) {
            store.insert(0, Ext.create(modelName, this.userForm.getValues()));

            this.getWorkersStore().sync
            ({
                 scope: this,
                 callback: function () {
                     this.getWorkersStore().load();
                     this.userForm.getForm().reset();
                     this.userForm.down('grid').getSelectionModel().deselectAll();
                 }
             });
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }
    },
    /*********************************
     *Fires when change button cliked
     **********************************/
    onUsersChangeClick: function () {
        if (this.userForm.isValid()) {
            var record = this.userForm.getRecord();
            var values = this.userForm.getValues();
            values.admin = this.userForm.down('checkbox[name="admin"]').getValue() ? 1 : 0;
            values.changepass = this.userForm.down('checkbox[name="changepass"]').getValue() ? 1 : 0;
            values.notify = this.userForm.down('checkbox[name="notify"]').getValue() ? 1 : 0;
            values.relogin = this.userForm.down('checkbox[name="relogin"]').getValue() ? 1 : 0;
            record.set(values);
            this.getWorkersStore().sync
            ({
                 scope: this,
                 success: function () {
                     //this.getWorkersStore().load();
                     //this.userForm.getForm().reset();
                     //this.userForm.down('grid').getSelectionModel().deselectAll();
                     this.userForm.down('button#change').disable();
                 }
             });
        } else {
            EMS.util.Util.showErrorMsg('Please fill up required fields!');
        }
    },
    /*********************************
     *Fires when fields changed
     **********************************/
    onUsersFieldsChange: function (field, newValue, oldValue, eOpts) {
        var rec = this.userForm.down('grid').getSelectionModel().getSelection()[0];
        if (rec && !(rec.data['laboratory_id'] == 'laborato-ry00-0000-0000-000000000001' && rec.data['worker'] == 'admin'))
            this.userForm.down('button#change').enable();
    },
    /*********************************
     * Groups delete record
     **********************************/
    handleUsersActionColumn: function (column, action, view, rowIndex, colIndex, item, e) {
        var me = this;
        if (action == 'delete') {
            var store = me.userForm.down('grid').getStore(),
                    rec = store.getAt(rowIndex);
            Ext.MessageBox.show
            ({
                 title: 'DELETE',
                 msg: 'Do you want to delete "' + rec.data['worker'] + '"?',
                 icon: Ext.MessageBox.QUESTION,
                 fn: function (buttonId) {
                     if (buttonId === "yes") {
                         me.groupForm.getForm().reset();
                         store.remove(rec);
                         store.sync
                         ({
                              callback: function () {
                                  store.load();
                              }
                          });
                     }
                 },
                 buttons: Ext.Msg.YESNO
             });
        }
    },


    /*

     gridedit: function (grid, record) {
     var edit = Ext.create('EMS.view.user.Edit', {newcomp: false, modal: true});
     edit.down('form').loadRecord(record);
     edit.show();
     },

     edit: function () {
     var edit = Ext.create('EMS.view.user.Edit', {newcomp: false, modal: true});
     var form = edit.down('form');
     form.getForm().findField('worker').setReadOnly(true);
     var store = this.getWorkerStore();
     var idx = store.findExact('id', USER_ID);//,0,false,false,true);
     var record = store.getAt(idx);
     form.loadRecord(record);
     edit.show();
     return edit;
     },

     newworkerwin: function (button) {
     var edit = Ext.create('EMS.view.user.Edit', {newcomp: true, modal: true});
     edit.show();
     },
     update: function (button) {
     var win = button.up('window');
     var form = win.down('form');
     var record = form.getRecord();
     var values = form.getValues();

     if (win.newcomp) {
     if (values.Worker !== '' || values.fname !== '' || values.lname !== '') {
     EMS.store.Worker.insert(0, values);
     } else {
     Ext.Msg.show({
     title: 'Save Failed',
     msg: 'Empty fields are not allowed',
     icon: Ext.Msg.ERROR,
     buttons: Ext.Msg.OK
     });
     return false;
     }
     } else {
     if (values.passwd === '' && !Rights.check(USER_ID, 'WorkerEdit')) {
     Ext.Msg.show({
     title: 'Empty password',
     msg: 'Please fill password field',
     icon: Ext.Msg.ERROR,
     buttons: Ext.Msg.OK });
     return false;
     }
     if (values.newpass !== values.newpassr) {
     Ext.Msg.show({
     title: 'Password not match',
     msg: 'New password does not match, please retype',
     icon: Ext.Msg.ERROR,
     buttons: Ext.Msg.OK });
     return false;
     }
     var Upper = 0;
     var Numbers = 0;
     var Symbols = 0;
     if (values.newpass !== '') {
     for (i = 0; i < values.newpass.length; i++) {
     if (values.newpass[i].match(/[A-Z]/g)) {
     Upper++;
     }
     if (values.newpass[i].match(/[0-9]/g)) {
     Numbers++;
     }
     if (values.newpass[i].match(/(.*[!,@,#,$,%,^,&,*,?,_,~])/)) {
     Symbols++;
     }
     }
     if (Upper < 2 || Numbers + Symbols < 2 || values.newpass.length === (Upper + Numbers + Symbols)) {
     Ext.Msg.show({
     title: 'Password',
     msg: 'Password should contain different characters<br> at least 2 uppercase letters and numbers/symbols',
     icon: Ext.Msg.ERROR,
     buttons: Ext.Msg.OK });
     return false;
     }
     }
     if (values.notify && values.email === '') {
     Ext.Msg.show({
     title: 'Cant notify',
     msg: 'Cant notify without email',
     icon: Ext.Msg.ERROR,
     buttons: Ext.Msg.OK });
     return false;
     }

     if (form.getForm().isValid()) {
     console.log('recset', record);
     record.set(values);
     //record.setDirty();

     //EMS.store.Worker.add(record);
     EMS.store.Worker.on('datachanged', function (thestore, eopts) {
     Ext.Msg.show({
     title: 'Password',
     msg: 'Operation complete successfully',
     icon: Ext.Msg.OK,
     buttons: Ext.Msg.OK });
     win.close();
     }, this, { single: true });
     EMS.store.Worker.sync();
     }
     }

     }*/
});
