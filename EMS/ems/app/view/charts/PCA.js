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

Ext.require('Ext.chart.*');

Ext.define('EMS.view.charts.PCA',
           {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel','EMS.view.charts.ShapeCollection'],
               title : 'Add Preliminary Results',
               layout: {
                   type: 'hbox',
                   align: 'stretch'
               },
               iconCls: 'default',
               //closeAction: 'hide',
               maximizable: true,
               collapsible: true,
               constrain: true,
               minHeight: 550,
               minWidth: 700,
               height: 550,
               width: 900,

               initComponent: function() {
                   var me=this;

                   var color=["yellow","magenta","purple","red","green","blue"];
                   var coll=['circle','cross','plus','triangle','diamond','square'];

                   var crtChart=function(xax,yax) {
                       return {
                           xtype: 'chart',
                           style: 'background:#fff',
                           animate: false,
                           legend: false,
                           border: true,
                           store: EMS.store.PCAChart,
                           shadow: true,
                           theme: 'Category1',
                           axes: [{
                                   type: 'Numeric',
                                   position: 'bottom',
                                   fields: [xax],
                                   title: xax,
                                   grid: true

                               } , {
                                   type: 'Numeric',
                                   position: 'left',
                                   fields: [yax],
                                   title: yax,
                                   grid: true
                               }],
                           series: [{
                                   type: 'scatter',
                                   axis: 'left',
                                   markerConfig: {
                                       type: 'circle',
                                       radius: 4,
                                       size: 4
                                   },
                                   label: {
                                       display: 'under'
                                       //minMargin: '70'
                                       //color:
                                   },
                                   renderer: function(sprite, record, attr, index){
                                       //console.log(record.get('color'),index,sprite,attr,this);
                                       var highlight = record.get('color');
                                       var comp=EMS.view.charts.ShapeCollection[coll[highlight-1]]({radius: 5, size: 5,x:0,y:0 });
                                       Ext.apply(sprite,comp);
                                       return Ext.apply(attr,{fill: color[highlight-1],type: comp.type, path: comp.path});
                                   },
                                   xField: xax,
                                   yField: yax
                               }
                           ]
                       }
                   };
                   var chart1=Ext.create('Ext.chart.Chart',crtChart('PC1','PC2'));
                   var chart2=Ext.create('Ext.chart.Chart',crtChart('PC1','PC3'));
                   me.items=[{
                                 xtype: 'panel',
                                 frame: false,
                                 border: true,
                                 region: 'center',
                                 collapsible: false,
                                 flex:1,
                                 title:'PCA PC1~PC2',
                                 layout: 'fit',
                                 items: [ chart1 ]
                             },{
                                 xtype: 'panel',
                                 frame: false,
                                 border: true,
                                 region: 'center',
                                 collapsible: false,
                                 flex:1,
                                 title:'PCA PC1~PC3',
                                 layout: 'fit',
                                 items: [ chart2 ]
                             }];
                   me.callParent(arguments);
               }
           });
