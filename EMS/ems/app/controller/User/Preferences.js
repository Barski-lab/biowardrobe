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

Ext.define('EMS.controller.User.Preferences', {
    extend: 'Ext.app.Controller',
    stores: ['Worker'],
    models: ['Worker'],
    views: ['user.Preferences'],

    worker: {},
    groupForm: {},
    userForm: {},

    init: function () {
        this.control
        ({
             'userpreferences': {
                 show: this.onShow
             },
             'userpreferences button[itemId=save]': {
                 click: this.onSaveClick
             },
             'userpreferences button[itemId=cancel]': {
                 click: this.onCancelClick
             }

         });
        this.worker = this.getWorkerStore().getAt(0);
        Ext.apply(Ext.form.field.VTypes, {
            customPass: function(val, field) {
                return /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,50})/.test(val);
            },
            customPassText: 'Not a valid password.  Length must be at least 8 characters and maximum of 20 Password must contain one digit, one letter lowercase, one letter uppercase'
        });
    },
    /*********************************
     *
     *
     *
     **********************************/
    onShow: function (window) {
        this.userForm = window.down('form');
        this.userForm.getForm().loadRecord(this.worker);
        this.userForm.down('textfield[name="passwd"]').setValue("");
        this.userForm.down('textfield[name="newpass"]').setValue("");
    },
    /*********************************
     * Fires when add button cliked
     **********************************/
    onSaveClick: function (button) {
        var record = this.userForm.getRecord();
        var values = this.userForm.getValues();
        var me = this;

        values.notify = this.userForm.down('checkbox[name="notify"]').getValue() ? 1 : 0;

        if (values.passwd === '') {
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

        if (values.notify && values.email === '') {
            Ext.Msg.show({
                             title: 'Cant notify',
                             msg: 'Cant notify without email',
                             icon: Ext.Msg.ERROR,
                             buttons: Ext.Msg.OK });
            return false;
        }

        if (this.userForm.getForm().isValid()) {
            //values.set("worker",values.worker);
            this.worker.set(values);
            this.worker.modified['worker']="";
            //this.worker.setDirty();
            this.getWorkerStore().sync
                    ({
                         success: function () {
                            //me.getWorkerStore().load();
                             button.up('window').close();
                        }
                    });
        } else {
            Ext.Msg.show({
                             title: 'ERROR',
                             msg: 'Form does not correctly filled up',
                             icon: Ext.Msg.ERROR,
                             buttons: Ext.Msg.OK });
            return false;
        }
    },
    /*********************************
     * Fires when  button cliked
     **********************************/
    onCancelClick: function (button) {
        button.up('window').close();
    }
/*
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
