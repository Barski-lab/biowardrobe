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
Ext.define('EMS.view.user.Groups', {
    extend: 'Ext.form.Panel',
    alias: 'widget.groupsedit',
    requires: ['EMS.util.Util'],
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [
        {
            xtype: 'fieldset',
            title: 'Laboratory information',
            padding: {top: 0, right: 1, left: 1, bottom: 0},

            margin: 0,
            collapsible: false,

            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'grid',
                    flex: 3,
                    height: '100%',
                    hideHeaders: true,
                    margin: {top: 0, right: 5, left: 0, bottom: 0},
                    store: 'Laboratories',
                    padding: 0,
                    columns: [
                        {header: 'Laboratory information', dataIndex: 'name', flex: 1,
                            renderer: function(value,metaData,record) {
                                metaData.css = 'multilineColumn';
                                return Ext.String.format('<div class="groupstopic"><b>{0}</b><span style="color: #333;">{1}</span></div>', value, record.get('description') || "Unknown");
                            }
                        },
                        {header: 'description', dataIndex: 'description',hidden: true, flex: 1},
                        {
                            xtype: 'actioncolumn',
                            width: 30,
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            items: [
                                {
                                    isDisabled: function(view,rowIndex,colIndex,item,record) {
                                        if(record.data.id=="00000000-0000-0000-0000-000000000000" || record.data.id=="laborato-ry00-0000-0000-000000000001")
                                            return true;
                                        return false;
                                    },
                                    handler: function(view, rowIndex, colIndex, item, e) {
                                        this.fireEvent('itemclick', this, 'delete', view, rowIndex, colIndex, item, e);
                                    },
                                    iconCls: 'users3-delete',
                                    tooltip: 'Delete'
                                }
                            ]
                        }

                    ]
                } ,
                {
                    xtype: 'panel',
                    flex: 2,
                    margin: {top: 0, right: 0, left: 5, bottom: 0},
                    padding: 0,
                    defaults: {
                        labelWidth: 120,
                        labelAlign: 'top'
                    },
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'name',
                            fieldLabel: 'Laboratory name',
                            padding: 0,
                            margin: 0,
                            afterLabelTextTpl: EMS.util.Util.required,
                            allowBlank: false,
                            flex: 1
                        },
                        {
                            xtype: 'textareafield',
                            name: 'description',
                            margin: 0,
                            padding: 0,
                            fieldLabel: 'Laboratory description',
                            afterLabelTextTpl: EMS.util.Util.required,
                            allowBlank: false,
                            flex: 3
                        },
                        {
                            xtype: 'fieldcontainer',
                            //flex: 1,
                            margin: 0,
                            padding: 0,
                            hight: 10,
                            layout: {
                                type: 'hbox'
                            },
                            items: [
                                {
                                    xtype: 'button',
                                    text: 'Add',
                                    itemId: 'add',
                                    iconCls: 'users3-add',
                                    margin: 8,
                                    flex: 1
                                } ,
                                {
                                    xtype: 'button',
                                    text: 'Change',
                                    itemId: 'change',
                                    iconCls: 'users3-edit',
                                    margin: 8,
                                    flex: 1
                                }
                            ]
                        }
                    ]//
                }

            ]
        }
    ]

});
