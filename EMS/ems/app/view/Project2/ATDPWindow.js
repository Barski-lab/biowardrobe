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


Ext.define('EMS.view.Project2.ATDPWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.atdpwindow',

    requires: [
        'EMS.view.Project2.ATDPChart',
    ],

    title: 'Average Tag Density and Tag Density Heatmap',

    maximizable: true,
    constrain: true,
    maximized: true,
    plain: true,
    border: false,
    focusOnToFront: true,

    bodyPadding: 0,
    frame: false,
    collapsible: false,

    minHeight: 350,
    minWidth: 300,
    height: 800,
    width: 1100,

    layout: 'fit',
    iconCls: 'chart-line',
    buttonAlign: 'center',

    items: [
        {
            xtype: 'tabpanel',
            itemId: 'atdpmainwindowtabpanel',
            frame: false,
            border: false,
            bodyPadding: 0,
            plain: true,
            activeTab: 0
        }
    ]
});

