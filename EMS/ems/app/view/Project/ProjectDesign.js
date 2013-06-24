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
Ext.require([
                'Ext.grid.*',
                'Ext.data.*',
                'Ext.dd.*'
            ]);

Ext.define('EMS.view.Project.ProjectDesign', {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel'],
               title : 'Project Design',
               id: 'ProjectDesign',
               layout: 'fit',
               iconCls: 'default',
               maximizable: true,
               collapsible: true,
               constrain: true,
               minHeight: 650,
               minWidth: 800,
               height: 650,
               width: 1150,
               initComponent: function() {
                   var me = this;
                   var closebutt={
                       minWidth: 90,
                       text: 'Close',
                       handler: function() { me.close(); }
                   };
                   me.addEvents('startAnalysis');
                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: {
                                            pack: 'center'
                                        },
                                        items: [closebutt]
                                    }];

                   me.items=[ {
                                 xtype: 'container',
                                 layout: {
                                     type: 'hbox',
                                     align: 'stretch'
                                 },
                                 items: [
                                     {
                                         xtype: 'container',
                                         margin: '0 0 5 5',
                                         layout: {
                                             type: 'vbox',
                                             align: 'stretch'
                                         },
                                         flex: 1,
                                         items: [
                                             {
                                                 xtype: 'fieldset',
                                                 title: 'Add groups',
                                                 height: 70,
                                                 padding: 0,
                                                 margin: '0 0 5 0',
                                                 layout: {
                                                     type: 'hbox'
                                                 },
                                                 items: [{
                                                         xtype: 'textfield',
                                                         margin: '0 5 0 5',
                                                         id: 'prpjectdesign-group-name',
                                                         fieldLabel: 'Group name',
                                                         submitValue: false,
                                                         labelAlign: 'top',
                                                         flex: 1,
                                                         labelWidth: 120
                                                     } , {
                                                         xtype: 'button',
                                                         margin: '22 5 0 5',
                                                         width: 100,
                                                         text: 'add',
                                                         id: 'projectdesign-group-add',
                                                         submitValue: false,
                                                         iconCls: 'folder-add'
                                                     } , {
                                                         xtype: 'button',
                                                         margin: '22 5 0 5',
                                                         width: 110,
                                                         text: 'Laboratory data',
                                                         id: 'projectdesign-preliminary-button',
                                                         submitValue: false,
                                                         iconCls: 'default'
                                                     }]
                                             } , {
                                                 xtype: 'treepanel',
                                                 useArrows: true,
                                                 store: me.resultGrpStore,
                                                 rootVisible: false,
                                                 singleExpand: false,
                                                 border: true,
                                                 rowLines: true,
                                                 multiSelect: true,
                                                 flex: 1,
                                                 columns: [{
                                                         xtype: 'treecolumn',
                                                         text: 'Groups/items',
                                                         flex: 1,
                                                         minWidth: 120,
                                                         dataIndex: 'item'
                                                     } , { header: 'Description', dataIndex: 'description', flex:2, minWidth: 70,
                                                         renderer: function(value,meta,record) {
                                                             if(record.data.leaf===false) return '';
                                                             return record.data['description'];
                                                         }
                                                     } , {
                                                         xtype: 'actioncolumn',
                                                         width:35,
                                                         align: 'center',
                                                         sortable: false,
                                                         items: [{
                                                                 getClass: function(v, meta, rec) {
                                                                     if(rec.data.root === true)
                                                                         return;
                                                                     this.items[0].tooltip = 'Delete';
                                                                     this.items[0].handler = function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                                                                         if(rec.data.status > 0 && rec.data.leaf === false) {
                                                                             Ext.Msg.show({
                                                                                              title: 'Deleteing group '+record.data.item,
                                                                                              msg: 'Are you sure, that you want delete all data that belongs to "'+record.data.item
                                                                                                   +'".<br> This process are going to delete the group from finished analysis<br>'+
                                                                                                   'All plots and results that have the group will be deleted.',
                                                                                              icon: Ext.Msg.QUESTION,
                                                                                              buttons: Ext.Msg.YESNO,
                                                                                              fn: function(btn) {
                                                                                                  if(btn !== "yes") return;
                                                                                                  record.remove(true);
                                                                                              }
                                                                                          });
                                                                         } else {
                                                                             record.remove(true);
                                                                             me.analysisStore.load();
                                                                         }

                                                                     }
                                                                     if(rec.data.leaf===false)
                                                                         return 'folder-delete';

                                                                     if(rec.parentNode.data.status===0)
                                                                         return 'table-row-delete';
                                                                 }
                                                             }]
                                                     }
                                                 ],
                                                 viewConfig: {
                                                     copy: true,
                                                     enableTextSelection: false,
                                                     plugins: {
                                                         ptype: 'treeviewdragdrop',
                                                         dragGroup: 'result2analyse',
                                                         appendOnly: true,
                                                         dropGroup: 'analyse2result'
                                                     }
                                                 }
                                             }//treepanel
                                         ]
                                     } , {
                                         xtype: 'splitter',
                                         margin: "0 0 0 0"
                                     } , {
                                         xtype: 'container',
                                         margin: '0 0 5 0',
                                         layout: {
                                             type: 'vbox',
                                             align: 'stretch'
                                         },
                                         flex: 1,
                                         items: [
                                             {
                                                 xtype: 'fieldset',
                                                 title: 'Type of analysis',
                                                 height: 70,
                                                 padding: 0,
                                                 margin: '0 0 5 0',
                                                 layout: {
                                                     type: 'hbox'
                                                 },
                                                 items: [
                                                     {
                                                         xtype: 'textfield',
                                                         id: 'analyse-caption',
                                                         fieldLabel: 'Caption',
                                                         submitValue: false,
                                                         labelAlign: 'top',
                                                         afterLabelTextTpl: required,
                                                         margin: '0 5 0 5',
                                                         labelWidth: 120,
                                                         flex: 1
                                                     } , {
                                                         xtype: 'combobox',
                                                         displayField: 'name',
                                                         valueField: 'id',
                                                         editable: false,
                                                         id: 'analyse-type',
                                                         afterLabelTextTpl: required,
                                                         allowBlank: false,
                                                         fieldLabel: 'Type',
                                                         labelAlign: 'top',
                                                         labelWidth: 120,
                                                         margin: '0 5 0 5',
                                                         store: me.atStore,
                                                         width: 100
                                                     } , {
                                                         xtype: 'button',
                                                         margin: '22 5 0 5',
                                                         width: 100,
                                                         text: 'add',
                                                         id: 'analyse-add',
                                                         submitValue: false,
                                                         iconCls: 'folder-add'

                                                     }]
                                             } , {

                                                 xtype: 'treepanel',
                                                 store: me.analysisStore,
                                                 rootVisible: false,
                                                 //singleExpand: true,
                                                 border: true,
                                                 flex: 3,
                                                 columns: [{
                                                         xtype: 'treecolumn',
                                                         text: 'Groups/items',
                                                         flex: 1,
                                                         width: 70,
                                                         dataIndex: 'item'
                                                     } , {
                                                         header: 'Type',
                                                         dataIndex: 'atype_id',
                                                         flex:1,
                                                         width: 70,
                                                         renderer: function(value,meta,record) {
                                                             if(record.data.parentId==='root') {
                                                                 var rec=me.atStore.findRecord('id',value,0,false,false,true);
                                                                 return rec.data.name;
                                                             }
                                                             if(record.data.leaf===true) {
                                                                 //console.log(record);
                                                                 return record.data.type;
                                                             }
                                                             return '';
                                                         }
                                                     } , {
                                                         xtype: 'actioncolumn',
                                                         width:55,
                                                         align: 'center',
                                                         sortable: false,
                                                         items: [
                                                             {
                                                                 isDisabled: function(view,rowIndex,colIndex,item,record) {
                                                                     if(record.data.status > 1 || record.data.status === 0)
                                                                         return true;
                                                                     return false;
                                                                 },
                                                                 getClass: function(v, meta, rec) {
                                                                     if(rec.data.root === true || rec.data.leaf === true)
                                                                         return '';
                                                                     //console.log(rec);
                                                                     this.items[0].tooltip = 'Run '+parseInt(rec.data.item_id)+'.';
                                                                     this.items[0].handler = function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                                                                         record.data.status=2;
                                                                         grid.refresh();
                                                                         me.fireEvent('startAnalysis',arguments);
                                                                     }
                                                                     return 'media-play-green';
                                                                 }
                                                             } , {
                                                                 getClass: function(v, meta, rec) {
                                                                     this.items[1].tooltip='';
                                                                     return 'space';
                                                                 }
                                                             } , {
                                                                 getClass: function(v, meta, rec) {
                                                                     if(rec.data.root === true)
                                                                         return;
                                                                     if(rec.data.status > 1 && rec.data.leaf) {
                                                                         return '';
                                                                     }
                                                                     this.items[2].tooltip = 'Delete '+parseInt(rec.data.item_id)+'.';
                                                                     this.items[2].handler = function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                                                                         var parent=record.parentNode;
                                                                         if(record.data.leaf===true) {
                                                                             parent.data.status=(parent.length-1>0)?1:0;
                                                                         }
                                                                         record.remove(true);
                                                                     }
                                                                     return 'folder-delete';
                                                                 }
                                                             }]
                                                     }],

                                                 viewConfig: {
                                                     enableTextSelection: false,
                                                     plugins: {
                                                         ptype: 'treeviewdragdrop',
                                                         appendOnly: true,
                                                         dropGroup: 'result2analyse',
                                                     },
                                                     listeners: {
                                                         beforedrop: function(node, data, overModel, dropPosition, dropHandlers) {
                                                             var me=this;
                                                             if(overModel.data.root === true)
                                                                 return false;
                                                             // Defer the handling
                                                             dropHandlers.wait = true;
                                                             overModel.expand(true,function(){
                                                                 for(var j=0; j<data.records.length;j++) {
                                                                     if(overModel.findChild("item_id",data.records[j].data.item_id) !== null) {
                                                                         continue;
                                                                     }
                                                                     if(data.records[j].data.leaf===true)
                                                                         continue;
                                                                     if(overModel.data.status<2) {
                                                                         /*
                                                                          * Switch over Experement types in future separate class or function!
                                                                          */
                                                                         switch(overModel.data.atype_id) {
                                                                         case 1:
                                                                             var copy=data.records[j].copy();
                                                                             if(overModel.childNodes.length  >= 2) {
                                                                                 overModel.data.status=1;
                                                                                 continue;
                                                                             }
                                                                             copy.data.leaf=true;
                                                                             copy.data.iconCls='folder';
                                                                             copy.data.id=Math.random()+data.records[j].data.id;
                                                                             if(overModel.childNodes.length === 0) {
                                                                                 copy.data.type="untreated";
                                                                             }
                                                                             if(overModel.childNodes.length === 1) {
                                                                                 copy.data.type="treated";
                                                                                 overModel.data.status=1;
                                                                                 me.refresh();
                                                                             }
                                                                             overModel.appendChild(copy.data);
                                                                             break;
                                                                         case 2:
                                                                             var copy=data.records[j].copy();
                                                                             copy.data.leaf=true;
                                                                             copy.data.iconCls='folder';
                                                                             copy.data.id=Math.random()+data.records[j].data.id;
                                                                             overModel.data.status=1;
                                                                             me.refresh();
                                                                             overModel.appendChild(copy.data);
                                                                             break;
                                                                         }
                                                                     }

                                                                 }
                                                                 data.records=[];
                                                                 dropHandlers.processDrop();
                                                             });

                                                             return true;
                                                         }

                                                     }//listeners
                                                 }
                                             }]
                                     } , {
                                         xtype: 'splitter',
                                         margin: "0 0 0 0"
                                     } , {
                                         xtype: 'container',
                                         margin: '5 5 5 0',
                                         layout: {
                                             type: 'vbox',
                                             align: 'stretch'
                                         },
                                         flex: 1,
                                         items: [
                                             {
                                                 xtype: 'grid',
                                                 store: me.resultStore,
                                                 flex: 1,
                                                 columns: [
                                                     {header: 'Name', dataIndex: 'name', flex: 1 },
                                                     {header: 'Description', dataIndex: 'description', flex: 1 },
                                                     {
                                                         xtype: 'actioncolumn',
                                                         width:55,
                                                         align: 'right',
                                                         sortable: false,
                                                         items: [
                                                             {
                                                                 iconCls: 'disk',
                                                                 text: 'download',
                                                                 tooltip: 'download',
                                                                 handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                                                                     window.location="data/csv.php?tablename="+record.data['tableName'];
                                                                 },
                                                                 isDisabled: function(view,rowIndex,colIndex,item,record) {
                                                                     if(record.data.atype_id===1)
                                                                         return false;
                                                                     return true;
                                                                 }
                                                             }, {
                                                                 getClass: function(v, meta, rec) {
                                                                     this.items[1].tooltip='';
                                                                     return 'space';
                                                                 }
                                                             } , {
                                                                 getClass: function(v, meta, rec) {
                                                                     this.items[2].tooltip = 'Delete'+parseInt(rec.data.item_id)+'.';
                                                                     this.items[2].handler = function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                                                                         Ext.Msg.show({
                                                                                          title: 'Deleteing result '+record.data.name,
                                                                                          msg: 'Are you sure, that you want delete all data that belongs to "'+record.data.name
                                                                                               +'".<br> This process are going to delete all plots and results.',
                                                                                          icon: Ext.Msg.QUESTION,
                                                                                          buttons: Ext.Msg.YESNO,
                                                                                          fn: function(btn) {
                                                                                              if(btn !== "yes") return;
                                                                                              grid.getStore().removeAt(rowIndex);
                                                                                              grid.getStore().sync();
                                                                                              grid.getStore().load();
                                                                                              me.analysisStore.load();
                                                                                          }
                                                                                      });
                                                                     }
                                                                     return 'folder-delete';
                                                                 }
                                                             }]
                                                     }
                                                 ]
                                             }]
                                     }//container
                                 ]
                             }
                           ];


                   me.callParent(arguments);
               }
           });
