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


Ext.define('EMS.view.Project2.ProjectDesigner', {
               extend: 'Ext.Window',
               alias : 'widget.ProjectDesigner',
               id: 'ProjectDesigner',
               width: 1100,
               height: 780,
               minWidth: 800,
               minHeight: 600,
               title: 'Project designer',
               closable: true,
               maximizable: true,
               closeAction: 'hide',
               constrain: true,
               iconCls: 'default',
               curColumn: 1,
               curRow: 1,
               maxColumn: 2,
               layout: {
                   type: 'border'
               },


               initComponent: function() {
                   var me=this;

                   me.addEvents('startAnalysis');

                   me.items =  [{
                                    layout: 'border',
                                    region:'west',
                                    border: false,
                                    split:true,
                                    margins: '2 0 5 5',
                                    width: 290,
                                    minSize: 100,
                                    maxSize: 500,
                                    items: [
                                        {
                                            id: 'project2-project-list',
                                            xtype: 'treepanel',
                                            title: 'Projects',
                                            region:'north',
                                            split: true,
                                            height: 360,
                                            minSize: 150,
                                            rootVisible: false,
                                            store: 'ProjectTree'
                                        } , {
                                            id: 'project2-details-panel',
                                            title: 'Details',
                                            region: 'center',
                                            bodyStyle: 'padding-bottom:15px;background:#eee;',
                                            autoScroll: true,
                                            html: '<p class="details-info">To start working with project designer. Please select project your want to work with or press "add" to start a new project design.</p>'
                                        }]
                                } , {
                                    xtype: 'panel',
                                    id: 'project2-content-panel',
                                    region: 'center',
                                    layout: {
                                        type: 'table',
                                        columns: me.maxColumn,
                                        tdAttrs: {
                                            style: {
                                                padding: 5,
                                                width: 370,
                                                height: 160
                                            }
                                        }
                                    },
                                    margins: '2 5 5 0',
                                    border: true
                                }];
                   this.callParent(arguments);
               },
               addAnalysis: function(data) {
                   var me =this;
                   var panel=Ext.getCmp('project2-content-panel');
                   var exist=Ext.getCmp('project2-analysis-'+data.id);
                   if(exist) {
                       exist.projectid=data.prjid;
                       var slide='t';
                       exist.getEl().slideIn(slide, {
                                              easing: 'easeInOut',
                                              duration: 200,
                                              stopAnimation:true
                                          });

                       return;
                   }
                   var element ={
                       xtype: 'panel',
                       width: 370,
                       height: 160,
                       id: 'project2-analysis-'+data.id,
                       projectid: data.prjid,
                       //column: me.curColumn,
                       margin: 5,
                       padding: 0,
                       draggable: true,
                       border: false,
                       frame: true,
                       layout: {
                           type: 'vbox',
                           align: 'stretch'
                       },
                       bodyStyle: 'background: #dfe9f6',
                       listeners: {
                           'render': function(panel) {
                               panel.body.on('click', function() {
                                   me.fireEvent('startAnalysis',{projectid: panel.projectid,atypeid: data.id});
                               });
                               panel.body.on('mouseover', function() {
                                   panel.setBodyStyle('background','#bed3ef');
                               });
                               panel.body.on('mouseout', function() {
                                   panel.setBodyStyle('background','#dfe9f6');
                               });
                           }
                       },
                       items:[{
                               xtype: 'container',
                               flex: 1,
                               minHeight:50,
                               layout: {
                                   type: 'hbox',
                                   align: 'stretch'
                               },
                               items:[{
                                       xtype: 'image',
                                       maxWidth: 40,
                                       maxHeight: 40,
                                       margin: 5,
                                       src: data.imgsrc
                                   },{
                                       xtype: 'label',
                                       flex: 1,
                                       html: '<div align="center"><font size=+3 color=#04408C>&nbsp;'+data.name+'</font></div>'
                                   }]
                           },{
                               flex: 2,
                               xtype: 'label',
                               html: '<div align="justify" style="margin-right:5px; margin-left: 5px; padding: 0; line-height:1.5em; "><i>&nbsp;&nbsp;&nbsp;&nbsp;'+data.description+'</i></div>'
                           }]
                   };
                   panel.add(element);

                   if(me.curColumn === me.maxColumn) {
                       me.curColumn=1;
                       me.curRow++;
                   } else {
                       me.curColumn++;
                   }

               }

           });
