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

Ext.define('EMS.view.user.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.userlist',

    initComponent: function () {

        Ext.apply(this, {

            store: EMS.store.Worker,

            columns: [
                Ext.create('Ext.grid.RowNumberer'),
                {header: 'Worker', dataIndex: 'worker', flex: 1},
                {header: 'First name', dataIndex: 'fname', flex: 1},
                {header: 'Last name', dataIndex: 'lname', flex: 1},
                {header: 'Email', dataIndex: 'email', flex: 1},
                {
                    xtype: 'actioncolumn',
                    width: 35,
                    sortable: false,
                    items: [
                        {
                            iconCls: 'table-row-delete',
                            tooltip: 'Delete Genome',
                            handler: function (grid, rowIndex, colIndex) {
                                EMS.store.Worker.removeAt(rowIndex);
                            }
                        }
                    ]
                }
            ],
            tbar: [
                {
                    text: 'New',
                    tooltip: 'Add a new Genome type',
                    id: "new-worker-window",
                    iconCls: 'table-row-add'
                },
                {
                    text: 'Save',
                    tooltip: 'Save changes',
                    handler: function () {
                        EMS.store.Worker.sync({
                            success: function (batch, options) {
                                EMS.store.Worker.load();
                            }});
                    },
                    iconCls: 'table-ok'
                } ,
                {
                    text: 'Reload',
                    tooltip: 'Reload',
                    handler: function () {
                        EMS.store.Worker.load();
                    },
                    iconCls: 'table-refresh'
                }
            ]//tbar
        })
        this.callParent(arguments);
    }
});
