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

Ext.define('EMS.view.Experiment.EGroup.EGroup', {
    extend: 'Ext.Window',
    alias: 'widget.EGroup',
    width: 900,
    minWidth: 400,
    height: 600,
    title: 'Folders Preferences',
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
        'EMS.view.Experiment.EGroup.EGroupList',
        'EMS.view.Experiment.EGroup.EGroupRights'
    ],
    items: [
        {
            xtype: 'egrouplist',
            frame: false,
            border: false,
            plain: true,
            flex: 1
        },
        {
            xtype: 'egrouprights',
            margin: {top: 0, right: 1, left: 1, bottom: 1},
            frame: false,
            border: true,
            plain: true,
            flex: 1
        }
    ]
//    initComponent: function () {
//    }
});
