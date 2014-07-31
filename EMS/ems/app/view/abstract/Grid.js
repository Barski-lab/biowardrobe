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


Ext.define('EMS.view.abstract.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.abstractgrid',

    columnLines: true,
    remoteSort: true,

//    celledit: false,
    hidefields: ['id'],

    initComponent: function () {
        var me = this;
        var columns = [];
        var initialConfig = me.initialConfig;
        var store = Ext.getStore(initialConfig.store);
        var fields = store.model.getFields();

        columns.push(Ext.create('Ext.grid.RowNumberer'));

        for (var i = 0; i < fields.length; i++) {
            var column = {};

            column['sortable'] = true;
            column['filterable'] = true;
            column['align'] = 'left';
            column['dataIndex'] = fields[i].name;

            if (fields[i].type.type === 'int') {
                column['align'] = 'right';
                column['width'] = 100;
            } else {
                column['flex'] = 1;
            }

            column['hidden'] = false;
            if (me.hidefields.indexOf(fields[i].name) != -1) {
                column['hidden'] = true;
            }

            column['header'] = fields[i].name;
            if (fields[i].header) {
                column['header'] = fields[i].header;
            }
            if (!column['hidden'] && (initialConfig.celledit || me.celledit) ) {
                column['editor'] = {
                    allowBlank: false
                };
            }

                columns.push(column);
        }

        columns = Ext.Array.merge(columns, me.columns);
        me.columns = columns;

        me.features = [
            Ext.create('Ext.ux.grid.FiltersFeature', {
                encode: true,
                local: false
            })
        ];

        if (initialConfig.celledit || me.celledit)
        {
            me.selModel = {
                selType: 'cellmodel'
            };
            me.plugins = [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    pluginId: 'cellplugin'
                })
            ];
        }

        me.callParent(arguments);
    }
});


