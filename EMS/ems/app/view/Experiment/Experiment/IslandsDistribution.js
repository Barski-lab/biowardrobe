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

Ext.define('EMS.view.LabDataEdit.IslandsDistribution', {
               extend: 'Ext.Panel',
               bodyPadding: 0,
               border: false,
               frame: false,
               layout: 'border',
               plain: true,
               title: 'Islands Distribution',
               iconCls: 'chart-column',

               initComponent: function() {
                   var me=this;
                   me.chart= Ext.create('EMS.view.charts.IslandsDistribution');
                   me.tbar = [
                       {
                           xtype: 'fieldcontainer',
                           layout: 'hbox',
                           items: [
                               {

                                   xtype: 'button',
                                   text: 'Save Chart',
                                   iconCls: 'svg-logo',
                                   handler: function () {
                                       Ext.create('Ext.form.Panel', {
                                           standardSubmit: true,
                                           url: 'data/svg.php',
                                           hidden: true,
                                           items: [
                                               {xtype: 'hiddenfield', name: 'id', value: me.id},
                                               {xtype: 'hiddenfield', name: 'type', value: "image/svg+xml"},
                                               {xtype: 'hiddenfield', name: 'svg', value: me.chart.save({type: 'image/svg+xml'})}
                                           ]
                                       }).getForm().submit();
                                   }
                               }
                           ]
                       }
                   ];
                   me.items=me.chart;
                   me.callParent(arguments);
               }
           });


