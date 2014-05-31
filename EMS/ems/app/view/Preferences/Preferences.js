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

Ext.define('EMS.view.Preferences.Preferences', {
    extend: 'Ext.Window',
    alias: 'widget.Preferences',
    width: 900,
    minWidth: 400,
    height: 600,
    title: 'Wardrobe Preferences',
    iconCls: 'table2',
    closable: true,
    maximizable: true,
    constrain: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    requires: [
        'EMS.util.Util',
        'EMS.view.Preferences.GlobalSettings'
    ],
    items: [
        {
            xtype: 'tabpanel',
            frame: false,
            border: false,
            plain: true,
            flex: 1,
            activeTab: 0,
            items: [
                {
                    xtype: 'globalsettings',
                    title: 'Global Settings',
                    iconCls: 'form-blue-edit'
                }
            ]

        }
    ]
});
