/****************************************************************************
 **
 ** Copyright (C) 2011-2014 Andrey Kartashov .
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
Ext.define('EMS.view.Preferences.GlobalSettings', {
    extend: 'Ext.form.Panel',
    alias: 'widget.globalsettings',

    requires: ['EMS.util.Util'],
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    fieldDefaults: {
        labelWidth: 120,
        labelAlign: 'top'
    },
    items: [
        {
            xtype: 'fieldset',
            title: 'Global Wardrobe Settings',
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
                    flex: 1,
                    margin: {top: 0, right: 5, left: 0, bottom: 0},
                    height: '100%',
                    store: 'Preferences',
                    padding: 0,
                    columns: [
                        {header: 'Key', dataIndex: 'key', flex: 2,
                            renderer: function (value, metaData, record) {
                                metaData.css = 'multilineColumn';
                                return Ext.String.format('<div class="grptopic"><b>{0}</b><span style="color: #333;">{1}</span></div>', value, record.get('description') || "Unknown");
                            }
                        },
                        {header: 'Description', dataIndex: 'description', hidden: true, flex: 1},
                        {header: 'Value', dataIndex: 'value', hidden: false, flex: 1}
                    ]
                } , //grid
                {
                    xtype: 'panel',
                    flex: 1,
                    height: '50%',
                    //                    overflowY: 'scroll',
                    margin: {top: 0, right: 0, left: 5, bottom: 0},
                    padding: 0,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'key',
                            fieldLabel: 'Key',
                            padding: 0,
                            margin: 0,
                            maxHeight:50,
                            readOnly: true,
//                            flex: 1
                        },
                        {
                            xtype: 'textareafield',
                            name: 'description',
                            margin: 0,
                            padding: 0,
//                            maxHeight:50,
                            fieldLabel: 'Description',
                            readOnly: true,
//                            flex: 1
                        },
                        {
                            xtype: 'textfield',
                            name: 'value',
                            fieldLabel: 'Value',
                            maxHeight:50,
                            padding: 0,
                            margin: 0,
//                            flex: 1
                        },
                        {
                            xtype: 'fieldcontainer',
//                            flex: 1,
                            margin: 0,
                            padding: 0,
//                                                        hight: 10,
                            layout: {
                                type: 'hbox'
                            },
                            items: [
                                {
                                    xtype: 'button',
                                    text: 'Add',
                                    itemId: 'add',
                                    iconCls: 'form-blue-add',
                                    disabled: true,
                                    margin: 8,
                                    flex: 1
                                },
                                {
                                    xtype: 'button',
                                    text: 'Change',
                                    itemId: 'change',
                                    iconCls: 'form-blue-edit',
                                    disabled: true,
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
