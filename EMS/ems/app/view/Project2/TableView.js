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


Ext.define('EMS.view.Project2.TableView', {
    extend: 'Ext.Panel',
    alias: 'widget.TableView',
    header: false,
    frame: false,
    border: false,
    plain: true,
    layout: 'fit',
    iconCls: 'table2',

    initComponent: function () {
        var me = this;

        me.columns = [];

        var fields = me.initialConfig.store.model.getFields();

        for (var i = 0; i < fields.length; i++) {
            var align = 'left';
            var width = 100;
            if (fields[i].type.type === 'int') {
                align = 'right';
            }
            me.columns.push({header: fields[i].name, sortable: true, filterable: true, width: width, align: align, dataIndex: fields[i].name, hidden: false });
        }

        var filters = {
            ftype: 'filters',
            encode: true,
            local: false
        };

        me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
            store: me.initialConfig.store,
            margin: "5 10 5 5",
            displayInfo: true
        });

        me.tbar = [
            me.m_PagingToolbar,
            '-',
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',

                items: [
                    {
                        xtype: 'button',
                        text: 'jump',
                        width: 80,
                        submitValue: false,
                        iconCls: 'genome-browser',
                        iconAlign: 'left',
                        margin: '5 10 5 10',
                        handler: function () {
                            me.fireEvent('gbjump', this, me);
                        }
                    }/* ,
                     {
                     xtype: 'button',
                     store: me.initialConfig.store,
                     text: 'save',
                     href: '',
                     id: 'tbl-table-save',
                     width: 80,
                     submitValue: false,
                     iconCls: 'disk',
                     margin: '5 10 5 10'
                     }*/
                ]
            }
        ];//tbar

        me.items = [
            {
                viewConfig: {
                    stripeRows: true,
                    enableTextSelection: true
                },
                xtype: 'grid',
                hight: 60,
                frame: false,
                border: false,
                plain: true,
                columnLines: true,
                store: me.initialConfig.store,
                remoteSort: true,
                features: [filters],
                columns: me.columns
            }
        ];//me.items
        me.callParent(arguments);
    }
});


