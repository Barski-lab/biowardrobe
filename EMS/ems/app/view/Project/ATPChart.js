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

Ext.define('EMS.view.Project.ATPChart', {
               extend: 'Ext.window.Window',
               bodyPadding: 0,
               border: false,
               frame: false,
               layout: 'border',
               plain: true,
               title: 'Average Tag Density',
               iconCls: 'chart-line',
               maximizable: true,
               collapsible: false,
               constrain: true,
               minHeight: 350,
               minWidth: 300,
               height: 900,
               width: 1180,

               initComponent: function() {
                   var me=this;
                   me.chart= Ext.create('EMS.view.charts.ATP',me.initialConfig);
                   me.items= [ me.chart ];
                   me.callParent(arguments);
               }
           });


