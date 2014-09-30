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

Ext.define('EMS.util.MessageBox', {
    extend: 'Ext.Window',
    alias: 'widget.emsmessagebox',

    closable: true,
    maximizable: false,
    constrain: true,
    modal: true,
    minWidth: 200,
    minHeight: 100,
    //    defaults: {
    //        padding: 5,
    //    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    requires: [
        'EMS.util.Util'
    ],

    config: {
        combobox: null,
        fields: null,
        msg: "",
        fn: function () {
        }
    },

    constructor: function (config) {
        this.initConfig(config);

        this.superclass.constructor.call(this, config);

        var me = this;
        var components = [];
        components = components.concat(
                [{
                     xtype: 'displayfield',
                     cls: Ext.baseCSSPrefix + 'message-box-text',
                     padding: 4,
                     value: this.getMsg(),
                     flex: 1
                 }]
        );
        if (this.getFields()) {
            components = components.concat(this.getFields());
        }
        if (this.getCombobox()) {
            this.field = Ext.create('Ext.form.ComboBox', this.getCombobox());
            components = components.concat([this.field]);
        }
        components = components.concat(
                [{
                     xtype: 'fieldcontainer',
                     minHeight: 15,
                     margin: 5,
                     padding: 5,
                     layout: {
                         type: 'hbox',
                         pack: 'center'
                     },
                     items: [
                         {
                             xtype: 'button',
                             text: 'Yes',
                             itemId: 'yes',
                             minWidth: 75,
                             scope: me,
                             handler: me.callBack
                         },
                         {
                             xtype: 'tbfill',
                             width: 10,
                             maxWidth: 20
                         },
                         {
                             xtype: 'button',
                             text: 'Cancel',
                             itemId: 'cancel',
                             minWidth: 75,
                             scope: me,
                             handler: me.callBack
                         }
                     ]
                 }]);

        this.add(
                components
        );

        return this;
    },
    onDestroy: function () {
        if (this.field)
            this.field.destroy();
        this.callParent(arguments);
    },
    callBack: function (btn) {
        var me = this;
        var userCallback = Ext.Function.bind(this.getFn());
        if (userCallback(btn.itemId, this.field, me) == false) {
            return;
        }
        this.close();
    }

});