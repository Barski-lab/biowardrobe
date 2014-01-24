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
               bodyPadding: 5,
               border: false,
               frame: false,
               layout: 'border',
               plain: true,
               title: 'Islands Distribution',
               iconCls: '',

               initComponent: function() {
                   var me=this;
                   me.chart= Ext.create('EMS.view.charts.IslandsDistribution');
                   me.tbar= [{
                              text: 'Save Chart',
                              handler: function() {
                                  Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
                                      if(choice == 'yes'){
                                          chart.save({
                                                         type: 'image/png'
                                                     });
                                      }
                                  });
                              }
                          }],
                   me.items= [{
                                  xtype: 'panel',
                                  frame: false,
                                  border: true,
                                  region: 'center',
                                  collapsible: false,
                                  title: 'Islands Distribution',
                                  layout: 'fit',
                                  items: [ me.chart ]
                              }];
                   me.callParent(arguments);
               }
           });


