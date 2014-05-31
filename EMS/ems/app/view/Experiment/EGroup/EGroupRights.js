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

Ext.define('EMS.view.Experiment.EGgroup.EGroupRights', {
    extend: 'Ext.form.Panel',
    alias: 'widget.egrouprights',
    requires: ['EMS.util.Util', 'Ext.selection.CheckboxModel'],
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [
        {
            xtype: 'fieldset',
            title: 'Folder rights',
            padding: {top: 0, right: 1, left: 1, bottom: 0},
            margin: {top: 10, right: 1, left: 1, bottom: 1},

            collapsible: false,

            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'grid',
                    flex: 1,
                    height: '100%',
                    hideHeaders: true,
                    margin: {top: 0, right: 1, left: 1, bottom: 1},
                    store: 'EGroupRights',
                    padding: 0,
                    selModel: Ext.create('Ext.selection.CheckboxModel', {
                        checkOnly: true,
                        renderer: function (val, meta, record, rowIndex, colIndex, store, view) {
                            var worker = Ext.getStore('Worker').getAt(0);
                            if(!worker.data.isla && !worker.data.isa)
                                return null;
                            if(record.data['locked']) {
                                view.getSelectionModel().select(record, true);
                                return null
                            }
                            if(worker.data.isla && worker.data['laboratory_id']==record.data['id']) {
                                view.getSelectionModel().select(record, true);
                                return null
                            }
                            if(record.data['egroup_id']) {
                                view.getSelectionModel().select(record, true);
                            }
                            meta.tdCls = Ext.baseCSSPrefix + 'grid-cell-special';
                            return '<div class="' + Ext.baseCSSPrefix + 'grid-row-checker">&#160;</div>';
                        }
                    }),
                    columns: [
                        {header: 'Allowed Laboratories', dataIndex: 'name', flex: 1,
                            renderer: function (value, metaData, record) {
                                metaData.css = 'multilineColumn';
                                return Ext.String.format('<div class="groupstopic"><b>{0}</b><span style="color: #333;">{1}</span></div>', value, record.get('description') || "");
                            }
                        },
                        {header: 'description', dataIndex: 'description', hidden: true, flex: 1}

                    ]
                }

            ]
        }
    ]

});
