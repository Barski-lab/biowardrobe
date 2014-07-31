/****************************************************************************
 **
 ** Copyright (C) 2014 Andrey Kartashov .
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


Ext.define('EMS.view.abstract.Catalog', {
    extend: 'EMS.view.abstract.Grid',
    alias: 'widget.abstractcatalog',
    celledit: true,

    viewConfig: {
        stripeRows: true
    },

    columns: [
        {
            xtype: 'actioncolumn',
            width: 35,
            sortable: false,
            items: [
                {
                    iconCls: 'table-row-delete',
                    tooltip: 'Delete',
                    handler: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
                        grid.getStore().removeAt(rowIndex);
                    }
                }
            ]
        }
    ],

    tbar: [
        {
            text: 'New',
            tooltip: 'Add a new record',
            handler: function (button) {
                var grid = button.up('grid');
                var store = grid.getStore();
                var model = store.getProxy().getModel();
                var modelName = model.modelName;
                var cellEditing = grid.getPlugin('cellplugin');
                var fields=model.getFields();
                var data = {};
                var name = fields[1]['name'];
                data[name] = 'New ' + name;
                store.insert(0, Ext.create(modelName, data));
                cellEditing.startEditByPosition({row: 0, column: 2});
            },
            iconCls: 'table-row-add'
        } ,
        {
            text: 'Save',
            tooltip: 'Save changes',
            handler: function (button) {
                var grid = button.up('grid');
                var store = grid.getStore();
                store.sync({
                               success: function (batch, options) {
                                   store.load();
                               }});
            },
            iconCls: 'table-ok'
        } ,
        {
            text: 'Reload',
            tooltip: 'Reload',
            handler: function (button) {
                var grid = button.up('grid');
                var store = grid.getStore();
                store.load();
            },
            iconCls: 'table-refresh'
        }
    ] //tbar
});
