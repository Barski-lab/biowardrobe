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

Ext.define('EMS.controller.Project', {
               extend: 'Ext.app.Controller',
               models: ['LabData','Worker','RPKM','ResultsGroupping','RType'],
               stores: ['LabData','Worker','RPKM','ResultsGroupping','RType'],
               views:  ['Project.Preliminary','Project.PreliminaryList'],

               init: function() {
                   var me=this;
                   me.control({
                                  '#ProjectPreliminary': {
                                      render: me.onPanelRendered,
                                      show: me.onPanelRendered,
                                      close: me.onClose
                                  },
                                  '#preliminary-worker-changed': {
                                      select: me.onComboboxWorkerFilter
                                  },
                                  '#preliminary-type-changed': {
                                      select: me.onComboboxTypeFilter
                                  },
                                  '#preliminary-group-add': {
                                      click: me. groupAddClick
                                  },
                                  '#preliminary-save': {
                                      click: me.onSaveClick
                                  }
                              });
               },
               syncCombosAndGrid:function() {
                   this.getRTypeStore().load();
                   this.getLabDataStore().getProxy().setExtraParam('workerid',Ext.getCmp('preliminary-worker-changed').getValue());
                   this.getLabDataStore().getProxy().setExtraParam('typeid',Ext.getCmp('preliminary-type-changed').getValue());
                   Ext.getCmp('ProjectPreliminary').m_PagingToolbar.moveFirst()
               },
               onComboboxWorkerFilter: function(combo, records, options) {
                   this.syncCombosAndGrid();
               },
               onComboboxTypeFilter: function(combo, records, options) {
                   this.syncCombosAndGrid();
               },
               onPanelRendered: function(view) {
                   var resStore=this.getResultsGrouppingStore();
                   resStore.setRootNode({
                       expanded: true,
                       text: "Project1",
                       leaf: false
                   });
                   resStore.load();
                   this.syncCombosAndGrid();
               },
               onClose: function(view) {
                   delete this.getLabDataStore().getProxy().extraParams['typeid'];
                   Ext.getCmp('ProjectPreliminary').m_PagingToolbar.moveFirst()
               },
               groupAddClick: function(button,e,eOpts) {
                   var grpname=Ext.getCmp('preliminary-group-name');
                   grpname.allowBlank=false;
                   grpname.validate();
                   if(!grpname.isValid()) {
                       return false;
                   }
                   var r = Ext.create('EMS.model.ResultsGroupping', {
                                          item: grpname.getValue()
                                      });
                   this.getResultsGrouppingStore().getRootNode().appendChild(r);
                   grpname.allowBlank=true;
               },
               onSaveClick: function(button,e,eOpts) {
                   this.getResultsGrouppingStore().sync();
               }
           });
