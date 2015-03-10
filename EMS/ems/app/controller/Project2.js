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


Ext.define('EMS.controller.Project2', {
    extend: 'Ext.app.Controller',
    models: ['ProjectLabData', 'Worker', 'RPKM', 'RType', 'AType', 'ProjectTree', 'GeneList', 'PCAChart', 'ATDPChart', 'ATDP', 'TableView', 'ATDPHeatA','AdvancedR'],
    stores: ['ProjectLabData', 'Worker', 'Workers', 'RPKM', 'RType', 'AType', 'ProjectTree', 'GeneList', 'PCAChart', 'ATDPChart', 'ATDP', 'TableView', 'ATDPHeatA','AdvancedR'],
    views: ['Project2.ProjectDesigner', 'Project2.GenesLists', 'Project2.Filter', 'Project2.DESeq', 'charts.ATP', 'Project2.TableViewWindow', 'Project2.TableView'],
    requires: ['EMS.util.Util'],
    worker: {},

    init: function () {
        var me = this;
        me.atype = undefined;
        me.control({
                       'ProjectDesigner': {
                           render: me.onProjectDesignerWindowRendered,
                           startAnalysis: me.startAnalysis,
                           projectAdd: me.onProjectAdd
                       },
                       'TableView': {
                           gbjump: me.ongbjump
                       },
                       '#Project2R': {
                           Back: me.onBack,
                           revent: me.runR,
                           editr: me.editR,
                           //rview: me.ATDPWindow
                       },
                       '#Project2GenesLists': {
                           Back: me.onBack,
                           groupadd: me.onGroupAdd,
                           filter: me.filterApply
                       },
                       '#Project2DESeq': {
                           Back: me.onBack,
                           groupadd: me.onGroupAdd,
                           filter: me.filterApplyDeseq,
                           deseq: me.runDESeq
                       },
                       '#Project2ATDP': {
                           Back: me.onBack,
                           atdp: me.runATDP,
                           atdpview: me.ATDPWindow
                       },
                       '#Project2MANorm': {
                           Back: me.onBack,
                           manorm: me.runMANORM,
                           tableview: me.TableView
                       },
                       '#project2-project-list': {
                           select: me.onProjectSelect,
                           edit: me.onProjectEdit
                       },
                       '#project-worker-changed': {
                           select: me.onComboboxWorkerSelect
                       },
                       '#egroups': {
                           select: me.onComboboxEGroupSelect
                       },
                       '#projectgenelisttree': {
                           edit: me.onGeneListEdit,
                           beforeedit: me.onGeneListBeforeedit,
                           select: me.onGeneListSelect
                       },
                       '#projectgenelisttree > treeview': {
                           beforedrop: me.beforeGeneListDrop,
                           drop: me.GeneListDrop
                       }

                   });
        var me = this;
        this.worker = this.getWorkerStore().getAt(0);
    }, //init
    onProjectDesignerWindowRendered: function (view) {
        this.getController('Project.R');
    },
    /*************************************************************
     *************************************************************/
    onBack: function () {
        var mainPanel = Ext.getCmp('ProjectDesigner');
        mainPanel.restoreCenter();
    },
    /*************************************************************
     *************************************************************/
    onProjectAdd: function () {
        var me = this;
        var name = Ext.getCmp('project2-project-name').getValue();
        if (name.trim() === "")
            return;
        var store = me.getProjectTreeStore();
        var uuid = EMS.util.Util.UUID();

        var r = Ext.create('EMS.model.ProjectTree', {
            id: uuid,
            text: name,
            name: name,
            worker_id: me.worker.data['id'],
            dateadd: Ext.Date.format(new Date(), 'm/d/Y'),
            type: 0,
            isnew: 1,
            leaf: false,
            expanded: true
        });
        store.getRootNode().getChildAt(0).appendChild(r);
        store.sync();
        //console.log("Hi", store.getRootNode(), store.getRootNode().getChildAt(0));
        Ext.getCmp('project2-project-name').setValue(undefined);
    },

    /*************************************************************
     *************************************************************/
    onProjectEdit: function (editor, e) {
        e.record.save();
    },

    /*************************************************************
     *************************************************************/
    onProjectSelect: function (selModel, record, index) {
        var me = this;
        if (typeof me.PrjSelect !== 'undefined' && me.PrjSelect === index) {
            return;
        }
        me.PrjSelect = index;

        var mainPanel = Ext.getCmp('ProjectDesigner');
        var detp = Ext.getCmp('project2-details-panel');

        if (record.get('type') === 0) {//project
            var worker = "";
            if (this.worker.data.isa || this.worker.data.isla)
                worker = this.getWorkersStore().findRecord('id', record.get('worker_id'), 0, false, false, true).data.fullname;
            else
                worker = "unknown";

            detp.expand();
            var bd = detp.body;
            bd.update('').setStyle('background', '#fff');
            detp.getEl().slideIn('b', {
                easing: 'easeInOut',
                duration: 500,
                stopAnimation: true
            });
            bd.setHTML('<div style="padding:5px;">&nbsp;Project by: <b>' + worker + '</b><br>' + '&nbsp;Project date: <b>' + Ext.util.Format.date(record.get('dateadd'), 'm/d/Y') + '</b><br>' + '&nbsp;Description: <br>&nbsp;<i>' + record.get('description') + '</i><br>' + '</div>');

            mainPanel.restoreCenter();
            if (!me.atype) {
                me.atype = me.getATypeStore();
                me.atype.load({
                                  callback: function (records, operation, success) {
                                      if (success) {
                                          me.UpdateAddAnalysis(records, record);
                                      }
                                  }
                              });
            } else {
                me.UpdateAddAnalysis(me.atype.data.items, record);
            }
        }//if project
        if (record.get('type') === 1) {//folder owner/shared
            mainPanel.restoreCenter();
            mainPanel.hideAnalysis();
        }
    },
    /*************************************************************
     *************************************************************/
    UpdateAddAnalysis: function (records, record) {
        var panel = Ext.getCmp('ProjectDesigner');
        this.projectid = record.get('id');

        for (var i = 0; i < records.length; i++) {
            if (records[i].data.implemented === 0)
                continue;
            panel.addAnalysis({
                                  name: records[i].data.name,
                                  description: records[i].data.description,
                                  imgsrc: records[i].data.imgsrc,
                                  id: records[i].data.id,
                                  implemented: records[i].data.implemented,
                                  prjid: record.get('id')
                              });
        }
    },
    /*************************************************************
     *************************************************************/
    startAnalysis: function (data) {
        var me = this;
        var mainPanel = Ext.getCmp('ProjectDesigner');
        var resStore = me.getGeneListStore();
        var labStore = me.getProjectLabDataStore();
        var centralPan;

        resStore.getProxy().setExtraParam('projectid', data.projectid);
        resStore.getProxy().setExtraParam('atypeid', data.atypeid);
        resStore.load();

        var viewName;

        if (data.atypeid == 1 || data.atypeid == 6 || data.atypeid == 3) { //deseq, filter, deseq2
            labStore.getProxy().setExtraParam('isrna', 1);
            labStore.load();
        } else {
            labStore.getProxy().setExtraParam('isrna', 0);
            labStore.load();
        }

        if(data.atypeid === 1) {
            viewName = 'EMS.view.Project2.R';
        }  else if (data.atypeid === 3) {
            viewName = 'EMS.view.Project2.DESeq';
        } else if (data.atypeid == 6) {
            viewName = 'EMS.view.Project2.GenesLists';
        } else if (data.atypeid == 2) {
            return;
        } else if (data.atypeid == 4) {
            viewName = 'EMS.view.Project2.ATDP';
        } else if (data.atypeid == 5) {//MANorm
            viewName = 'EMS.view.Project2.MANorm';
        }

        mainPanel.replaceCenter(Ext.create(viewName, {
            labDataStore: labStore,
            resultStore: resStore,
            projectid: data.projectid,
            atypeid: data.atypeid
        }));
    },
    /*************************************************************
     *************************************************************/
    onComboboxWorkerSelect: function (combo, records, options) {
        this.getProjectLabDataStore().getProxy().setExtraParam('workerid', Ext.getCmp('project-worker-changed').getValue());
        combo.up('panel').up('panel').m_PagingToolbar.moveFirst();
    },
    /*************************************************************
     *************************************************************/
    onComboboxEGroupSelect: function (combo, records, options) {
        this.getProjectLabDataStore().getProxy().setExtraParam('egroup_id', combo.getValue());
        combo.up('panel').up('panel').m_PagingToolbar.moveFirst();
    },
    /*************************************************************
     *************************************************************/
    beforeGeneListDrop: function (node, data, overModel, dropPosition, dropHandlers) {
        //console.log(arguments);
        var me = this;
        dropHandlers.wait = true;

        if ((dropPosition !== 'append' && overModel.data.leaf === false) || ( overModel.data.id !== 'gd' && overModel.data.parentId !== 'gd') || overModel.data.root === true) {
            dropHandlers.cancelDrop();
            return false;
        }

        overModel.expand(false, function () {
            var base = overModel.childNodes.length;

            for (var i = 0; i < data.records.length; i++) {
                var cont = false;
                for (var j = 0; j < base; j++) {
                    if (typeof data.records[i].data.leaf != 'undefined' && !data.records[i].data.leaf) {
                        dropHandlers.cancelDrop();
                        return false;
                    }
                    if (data.records[i].data.id === overModel.childNodes[j].data.labdata_id || (typeof data.records[i].data.labdata_id !== 'undefined' && data.records[i].data.labdata_id === overModel.childNodes[j].data.labdata_id)) {
                        data.records.splice(i, 1);
                        cont = true;
                        i--;
                        break;
                    }
                }
                if (cont)
                    continue;

                var uuid = EMS.util.Util.UUID();
                var type = 1;
                if (typeof data.records[i].data.experimenttype_id !== 'undefined') {
                    if (data.records[i].data.experimenttype_id <= 2) {
                        type = 101;
                    }
                }

                if (typeof data.records[i].data.name4browser !== 'undefined') {
                    data.records[i].set('name', data.records[i].data.name4browser);
                    data.records[i].set('item_id', uuid);
                    data.records[i].set('labdata_id', data.records[i].data.id);
                    data.records[i].set('project_id', me.projectid);
                    data.records[i].set('expanded', false);
                    data.records[i].set('isnew', true);
                    data.records[i].set('conditions', data.records[i].data.combined);
                } else {
                    data.records[i].set('item_id', data.records[i].data.id);
                    data.records[i].set('isnew', false);
                }
                data.records[i].set('parent_id', overModel.data.id);
                data.records[i].set('leaf', true);
                data.records[i].set('type', type);
            }
            dropHandlers.processDrop();
        });

        return true;
    }, //beforeGeneListDrop

    /*************************************************************
     *************************************************************/
    GeneListDrop: function (node, data, overModel, dropPosition, eOpts) {
        for (var i = 0; i < data.records.length; i++) {
            //console.log(data.records[i]);
            if (data.records[i].data.isnew)
                data.records[i].data.id = data.records[i].raw.item_id;
        }
        this.getGeneListStore().sync();
    },
    /*************************************************************
     *************************************************************/
    onGroupAdd: function (field, event) {
        var me = this;
        var grpname = field[0];
        grpname.allowBlank = false;
        grpname.validate();
        if (!grpname.isValid())
            return false;

        var store = me.getGeneListStore();
        var uuid = EMS.util.Util.UUID();
        var r = Ext.create('EMS.model.GeneList', {
            id: uuid,
            item_id: uuid,
            name: grpname.getValue(),
            type: 1,
            isnew: true,
            leaf: false,
            expanded: true,
            project_id: me.projectid
        });
        store.getRootNode().getChildAt(0).appendChild(r);
        store.sync();
        //console.log(store.getRootNode().getChildAt(0));
        grpname.allowBlank = true;
        grpname.setValue(undefined);
    },
    /*************************************************************
     *************************************************************/
    runR: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid) {
        var me = this;
        this.getAdvancedRStore().load();
        var filterForm = Ext.create('EMS.view.Project2.RRun', {
            modal: true,
            item_id: record.data.item_id,
            atypeid: atypeid,
            tables: me.getGeneListStore().getRootNode(),
            onSubmit: function () {
                me.RSubmit(filterForm, record, atypeid);
            }
        }).show();
    },
    RSubmit: function (form, record, atypeid) {
        var me = this;
        var formData = form.getFormJson();
        Ext.Ajax.request({
                             url: 'data/RPrjRun.php',
                             method: 'POST',
                             timeout: 600000, //600 sec
                             success: function (response) {
                                 var json = Ext.decode(response.responseText);
                                 var store = me.getGeneListStore();
                                 store.load({node: store.getRootNode().getChildAt(1)});
                                 if (!json.success) {
                                     EMS.util.Util.Logger.log("Cant run R, error: " + json.message);
                                     Ext.MessageBox.show({
                                                             title: 'For you information',
                                                             msg: 'There was an error with R script.You have to rerun it.<br>Do you want dialog for R to be shown?<br>' + json.message,
                                                             icon: Ext.MessageBox.ERROR,
                                                             fn: function (buttonId) {
                                                                 if (buttonId === "yes") {
                                                                     form.show();
                                                                 } else {
                                                                     form.close();
                                                                 }
                                                             },
                                                             buttons: Ext.Msg.YESNO
                                                         });
                                 } else {
                                     form.close();
                                 }
                             },
                             failure: function () {
                                 EMS.util.Util.Logger.log("Cant run R, error");
                                 form.close();
                             },
                             jsonData: Ext.encode({
                                                      "project_id": me.projectid,
                                                      "atype_id": atypeid,
                                                      "R": formData
                                                  })
                         });
        form.hide();

    },
    editR: function () {
        var me = this;
        var form = Ext.create('EMS.view.Project2.RSrc', {
            modal: false,
        });
        form.show();
    },

    /*************************************************************
     *************************************************************/
    runATDP: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid) {
        var me = this;
        var filterForm = Ext.create('EMS.view.Project2.ATDPRun', {
            modal: true,
            item_id: record.data.item_id,
            atypeid: atypeid,
            tables: me.getGeneListStore().getRootNode(),
            onSubmit: function () {
                me.atdpSubmit(filterForm, record, atypeid);
            }
        }).show();
    },
    atdpSubmit: function (form, record, atypeid) {
        var me = this;
        var formData = form.getFormJson();
        Ext.Ajax.request({
                             url: 'data/ATDPPrjRun.php',
                             method: 'POST',
                             timeout: 600000, //600 sec
                             success: function (response) {
                                 var json = Ext.decode(response.responseText);
                                 var store = me.getGeneListStore();
                                 store.load({node: store.getRootNode().getChildAt(1)});
                                 if (!json.success) {
                                     EMS.util.Util.Logger.log("Cant run atdp, error: " + json.message);
                                     Ext.MessageBox.show({
                                                             title: 'For you information',
                                                             msg: 'There was an error with ATDP.You have to rerun it.<br>Do you want dialog for ATDP to be shown?<br>' + json.message,
                                                             icon: Ext.MessageBox.ERROR,
                                                             fn: function (buttonId) {
                                                                 if (buttonId === "yes") {
                                                                     form.show();
                                                                 } else {
                                                                     form.close();
                                                                 }
                                                             },
                                                             buttons: Ext.Msg.YESNO
                                                         });
                                 } else {
                                     form.close();
                                 }
                             },
                             failure: function () {
                                 EMS.util.Util.Logger.log("Cant run atdp, error");
                                 form.close();
                             },
                             jsonData: Ext.encode({
                                                      "project_id": me.projectid,
                                                      "atype_id": atypeid,
                                                      "name": formData.name,
                                                      "atdp": formData.atdp
                                                  })
                         });
        form.hide();

    },
    /*************************************************************
     *************************************************************/
    runMANORM: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid) {
        var me = this;
        var filterForm = Ext.create('EMS.view.Project2.MANormRun', {
            modal: true,
            item_id: record.data.item_id,
            atypeid: atypeid,
            tables: me.getGeneListStore().getRootNode(),
            onSubmit: function () {
                me.manormSubmit(filterForm, record, atypeid);
            }
        }).show();
    },
    manormSubmit: function (form, record, atypeid) {
        var me = this;
        var formData = form.getFormJson();
        Ext.Ajax.request({
                             url: 'data/MANormPrjRun.php',
                             method: 'POST',
                             timeout: 600000, //600 sec
                             success: function (response) {
                                 var json = Ext.decode(response.responseText);
                                 var store = me.getGeneListStore();
                                 store.load({node: store.getRootNode().getChildAt(1)});
                                 if (!json.success) {
                                     EMS.util.Util.Logger.log("Cant run manorm, error: " + json.message);
                                     Ext.MessageBox.show({
                                                             title: 'For you information',
                                                             msg: 'There was an error with MANorm.You have to rerun.<br>Do you want dialog for MANorm to be shown?<br>' + json.message,
                                                             icon: Ext.MessageBox.ERROR,
                                                             fn: function (buttonId) {
                                                                 if (buttonId === "yes") {
                                                                     form.show();
                                                                 } else {
                                                                     form.close();
                                                                 }
                                                             },
                                                             buttons: Ext.Msg.YESNO
                                                         });
                                 } else {
                                     form.close();
                                 }
                             },
                             failure: function () {
                                 EMS.util.Util.Logger.log("Cant run manorm, error");
                                 form.close();
                             },
                             jsonData: Ext.encode({
                                                      "project_id": me.projectid,
                                                      "atype_id": atypeid,
                                                      "manorm": formData
                                                  })
                         });
        form.hide();
    },
    /*************************************************************
     *************************************************************/
    runDESeq: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid) {
        var me = this;
        var filterForm = Ext.create('EMS.view.Project2.DESeqRun', {
            modal: true,
            item_id: record.data.item_id,
            atypeid: atypeid,
            tables: me.getGeneListStore().getRootNode(),
            onSubmit: function () {
                me.deseqSubmit(filterForm, record, atypeid);
            }
        }).show();
    },
    deseqSubmit: function (form, record, atypeid) {
        var me = this;
        var formData = form.getFormJson();
        Ext.Ajax.request({
                             url: 'data/DESeqPrjRun.php',
                             method: 'POST',
                             timeout: 600000, //600 sec
                             success: function (response) {
                                 var json = Ext.decode(response.responseText);
                                 var store = me.getGeneListStore();
                                 store.load({node: store.getRootNode().getChildAt(1)});
                                 if (!json.success) {
                                     EMS.util.Util.Logger.log("Cant run deseq, error: " + json.message);
                                     Ext.MessageBox.show({
                                                             title: 'For you information',
                                                             msg: 'There was an error with DESeq.You have to rerun.<br>Do you want dialog for DESeq to be shown?<br>' + json.message,
                                                             icon: Ext.MessageBox.ERROR,
                                                             fn: function (buttonId) {
                                                                 if (buttonId === "yes") {
                                                                     form.show();
                                                                 } else {
                                                                     form.close();
                                                                 }
                                                             },
                                                             buttons: Ext.Msg.YESNO
                                                         });
                                 } else {
                                     form.close();
                                 }
                             },
                             failure: function () {
                                 EMS.util.Util.Logger.log("Cant run deseq, error");
                                 form.close();
                             },
                             jsonData: Ext.encode({
                                                      "project_id": me.projectid,
                                                      "atype_id": atypeid,
                                                      "deseq": formData
                                                  })
                         });
        form.hide();
    },
    /*************************************************************
     *************************************************************/
    filterApplyDeseq: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
        var me = this;
        var filterForm = Ext.create('EMS.view.Project2.Filter', {
            modal: true,
            item_id: record.data.item_id,
            rtype_id: record.data.rtype_id,
            tables: me.getGeneListStore().getRootNode(),
            deseq: true,
            //localid: LocalStorage.FILTER_DESEQ,
            onSubmit: function () {
                me.filterSubmitDeseq(filterForm, record);
            }
        }).show();

    },
    filterSubmitDeseq: function (form, record) {
        var me = this;
        var uuid = EMS.util.Util.UUID();
        var formData = form.getFormJson();
        Ext.Ajax.request({
                             url: 'data/FilterSetPrjDeseqAdd.php',
                             method: 'POST',
                             success: function (response) {
                                 var json = Ext.decode(response.responseText);
                                 if (json.success) {
                                     var store = me.getGeneListStore();
                                     var r = Ext.create('EMS.model.GeneList', {
                                         id: uuid,
                                         item_id: uuid,
                                         name: formData[0].name,
                                         type: 2,
                                         isnew: false,
                                         leaf: true,
                                         conditions: json.data.conditions,
                                         project_id: me.projectid
                                     });
                                     store.getRootNode().getChildAt(2).appendChild(r);
                                     r.commit();
                                     form.close();
                                 } else {
                                     EMS.util.Util.Logger.log("Cant add filter error: " + json.message);
                                     form.close();
                                 }
                             },
                             failure: function () {
                             },
                             jsonData: Ext.encode({
                                                      "project_id": me.projectid,
                                                      "atype_id": 6,
                                                      "uuid": uuid,
                                                      "filters": formData
                                                  })
                         });

    },
    /*************************************************************
     *************************************************************/
    filterApply: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
        var me = this;
        var filterForm = Ext.create('EMS.view.Project2.Filter', {
            modal: true,
            item_id: record.data.item_id,
            tables: me.getGeneListStore().getRootNode(),
            deseq: false,
            //localid: LocalStorage.FILTER_STORAGE,
            onSubmit: function () {
                me.filterSubmit(filterForm, record);
            }
        }).show();

    },
    filterSubmit: function (form, record) {
        var me = this;
        var uuid = EMS.util.Util.UUID();
        var formData = form.getFormJson();
        Ext.Ajax.request({
                             url: 'data/FilterSetPrjAdd.php',
                             method: 'POST',
                             success: function (response) {
                                 var json = Ext.decode(response.responseText);
                                 if (json.success) {
                                     var store = me.getGeneListStore();
                                     var r = Ext.create('EMS.model.GeneList', {
                                         id: uuid,
                                         item_id: uuid,
                                         name: formData[0].name,
                                         type: 2,
                                         isnew: false,
                                         leaf: true,
                                         conditions: json.data.conditions,
                                         project_id: me.projectid
                                     });
                                     store.getRootNode().getChildAt(1).appendChild(r);
                                     r.commit();
                                     form.close();
                                 } else {
                                     EMS.util.Util.Logger.log("Cant add filter error: " + json.message);
                                     form.close();
                                 }
                             },
                             failure: function () {
                             },
                             jsonData: Ext.encode({
                                                      "project_id": me.projectid,
                                                      "atype_id": 6,
                                                      "uuid": uuid,
                                                      "filters": formData
                                                  })
                         });

    },
    /*************************************************************
     *************************************************************/
    onGeneListEdit: function (editor, e) {
        e.record.save();
    },
    /*************************************************************
     *************************************************************/
    onGeneListBeforeedit: function (editor, e) {
        return e.record.data.parentId !== 'root';
    },
    /*************************************************************
     *************************************************************/
    onGeneListSelect: function (rowmodel, record, index) {
        //console.log(arguments);
        var panel = Ext.getCmp('genelist-details-panel');
        var bd = panel.body;
        //if (record.get('parentId') === 'gl' || record.get('parentId') === 'de') {
        {
            panel.expand();
            bd.update('').setStyle('background', '#fff');
            bd.setHTML('<div style="margin-right:5px; color: #04408C; margin-left: 5px; align: left; padding: 0; line-height:1.5em; height: 100%;">' + 'Conditions:' + '<div class="panel-text">' + record.get('conditions') + '</div></div>');
        }
        /* else {
         panel.collapse();
         }*/
    },
    /*************************************************************
     *************************************************************/
    ATDPWindow: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid) {
        var tabs = Ext.create("EMS.view.Project2.ATDPWindow");

        this.ATDPview(grid, rowIndex, colIndex, actionItem, event, record, row, atypeid, tabs);
        this.ATDPHview(grid, rowIndex, colIndex, actionItem, event, record, row, atypeid, tabs.items.items[0]);
    },
    /*************************************************************
     *************************************************************/
    ATDPview: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid, tabs) {
        console.log(arguments, record.data);
        var me = this;
        var storc = this.getATDPStore();
        storc.getProxy().setExtraParam('id', record.data['item_id']);
        storc.load();
        var stor = this.getATDPChartStore();
        stor.getProxy().setExtraParam('tablename', record.data['tableName']);
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              var title = [];
                              for (var c = 0; c < storc.getTotalCount(); c++) {
                                  title.push(storc.getAt(c).get('pltname'));
                              }
                              var cols = 0;
                              var prop = [];
                              for (p in records[0].data) {
                                  if (cols > 0) prop[cols - 1] = p;
                                  cols++;
                              }
                              cols--;
                              var len = Math.abs(records[0].data.X);
                              var max = records[0].data[prop[0]];
                              for (var i = 0; i < records.length; i++) {
                                  for (var j = 0; j < cols; j++)
                                      if (records[i].data[prop[j]] > max)
                                          max = records[i].data[prop[j]];
                              }


                              tabs.items.items[0].insert(0, Ext.create("EMS.view.Project2.ATDPChart",
                                                                       {
                                                                           LEN: len,
                                                                           MAX: max,
                                                                           BNAME: title,
                                                                           COLS: cols,
                                                                           COLSN: prop,
                                                                           mask: 'horizontal',
                                                                           listeners: {
                                                                               select: {
                                                                                   scope: me,
                                                                                   fn: me.doWilcoxonMB
                                                                               }
                                                                           }
                                                                       }));
                              tabs.items.items[0].setActiveTab(0);
                              tabs.show();
                              //me.ATDPHview(grid, rowIndex, colIndex, actionItem, event, record, row, atypeid, tabs.items.items[0]);
                          }
                      }
                  });
    },
    /*************************************************************
     *  Making Wilcoxon test
     *************************************************************/
    doWilcoxonMB: function (chart, selection) {
        var me = this;
        if (!this.getATDPHeatAStore().lastOptions) {
            chart.mask.hide();
            return;
        }

        var w = chart.getWidth() - 250;
        console.log('widths:', w, chart.getWidth(), 'chart', chart,'sel=',selection);
        var step = 200;
        var msg = "";
        var type = 1;
        var l = 0, r = 0;
        if (chart.BNAME) {
            var k = 10000 / w;
            l = Math.floor(selection.x * k - 5000);
            var m = Math.abs(l) % step;
            if (l < 0 && m < 100) {
                l = l + m;
            } else if (l < 0 && m >= 100) {
                l = l - (step - m);
            } else if (l >= 0 && m < 100) {
                l = l - m;
            } else if (l >= 0 && m >= 100) {
                l = l + (step - m);
            }

            r = Math.floor(selection.width * k);
            m = Math.abs(r) % step;
            if (m < 100)
                r = l + r - m;
            else
                r = l + r + (step - m);

            if (r > 5000)
                r = 5000;
            if (r < -5000)
                r = -5000;
            if (l > 5000)
                l = 5000;
            if (l < -5000)
                l = -5000;
            msg = 'Please adjust the region for Wilcoxon rank-sum test (step is 200bp window)';
        } else {
            type = 2;
            step = 1;
            var k = 300 / w;
            l = Math.floor(selection.x * k);
            r = l + Math.floor(selection.width * k);


            if (r > 300)
                r = 300;
            if (r < 1)
                r = 1;
            if (l > 300)
                l = 300;
            if (l < 1)
                l = 1;
            msg = 'Please adjust the region for Wilcoxon rank-sum test. <br>There are 3 regions each one has 100 points.<br> First region from 1 to 100, second from 101 to 200 etc.';
        }
        Ext.create('EMS.util.MessageBox',
                   {
                       title: 'Adjust region',
                       msg: msg,
                       fields: [
                           {
                               xtype: 'fieldcontainer',
                               layout: 'hbox',
                               padding: 4,
                               items: [
                                   {
                                       xtype: 'numberfield',
                                       name: 'left',
                                       padding: 2,
                                       labelWidth: 120,
                                       labelAlign: 'top',
                                       fieldLabel: 'Position begins',
                                       afterLabelTextTpl: EMS.util.Util.required,
                                       allowBlank: false,
                                       allowDecimals: false,
                                       flex: 1,
                                       value: l,
                                       step: step,
                                       minValue: -5000,
                                       maxValue: 5000,
                                       //listeners: {
                                       //    change: function(field, value) {
                                       //        value = parseInt(value, 10);
                                       //        field.setValue(value + (step-value % step));
                                       //    }
                                       //}
                                   },
                                   {
                                       xtype: 'numberfield',
                                       name: 'right',
                                       padding: 2,
                                       labelWidth: 120,
                                       labelAlign: 'top',
                                       fieldLabel: 'Position ends',
                                       afterLabelTextTpl: EMS.util.Util.required,
                                       allowBlank: false,
                                       allowDecimals: false,
                                       flex: 1,
                                       value: r,
                                       step: step,
                                       minValue: -5000,
                                       maxValue: 5000,
                                       //listeners: {
                                       //    change: function(field, value) {
                                       //        value = parseInt(value, 10);
                                       //        field.setValue(value + (step-value % step));
                                       //    }
                                       //}

                                   }
                               ]
                           }
                       ],
                       fn: function (btn, cbox, mbox) {
                           if (btn == 'yes') {
                               var l = mbox.down('[name=left]').getValue();
                               var r = mbox.down('[name=right]').getValue();
                               me.doWilcoxonSet(l, r, type);
                           }
                           console.log('mask=', chart.mask);
                           chart.mask.hide();
                           return true;
                       }
                   }).show();

    },
    /*************************************************************
     *  Making Wilcoxon test
     *************************************************************/
    iqr: function (k, d, q1, q3, min, max) {
        var iq = (q3 - q1) * k
        var lW = q1 * 1 - iq;
        var rW = q3 * 1 + iq;
        if (lW < min) lW = min;
        if (rW > max) rW = max;
        return [lW * 1, rW * 1];
    },

    doWilcoxonSet: function (l, r, type) {
        var store = this.getATDPHeatAStore();
        if (!store.lastOptions) return;

        if (type == 1) {
            if (r > 5000)
                r = 5000;
            if (r < -5000)
                r = -5000;
            if (l > 5000)
                l = 5000;
            if (l < -5000)
                l = -5000;

            var window = 10000 / store.getAt(0).get('array')[0].length;
            var nl = Math.floor((l + 5000) / window), nr = Math.floor((r + 5000) / window);
        } else if (type == 2) {
            nl = l - 1;
            nr = r;
        }
        var darray = [];
        //var min = Infinity, max = -Infinity;
        for (var i = 0; i < store.getCount(); i++) {
            var stordata = store.getAt(i);

            var mapped = stordata.get('mapped');
            var k = 1;
            var kdiv = 1000000.0;

            if (!mapped || mapped == 0)
                mapped = kdiv;
            k = mapped / kdiv;

            var marray = [];
            var sarray=[];
            if (type == 1) {
                marray = stordata.get('array');
                sarray = marray.map(function (d) {
                    var s = 0.0;
                    for (var i = nl; i < nr; i++)
                        s += d[i];
                    return s / k;
                }).sort(d3.ascending);
            } else if (type == 2) {
                marray = stordata.get('bodyarray');
                var glengths = stordata.get('glengths');
                var rg=[100,200,300];
                var seg=[l,r];
                var mer=[];
                var body_segments=[];
                var rgl= 0,segl=0;
                var current_gene_length=0;
                var current_gene_coeff=0;

                while(rgl<rg.length && segl<seg.length) {

                    if(rg[rgl]<seg[segl] && segl==0) {
                        rgl++;
                        continue;
                    }

                    if(rg[rgl]<seg[segl]) {
                        mer.push(rg[rgl]);
                        rgl++;
                    } else if (seg[segl]<rg[rgl]) {
                        mer.push(seg[segl]);
                        segl++;
                    } else {
                        mer.push(seg[segl]);
                        segl++;rgl++;
                    }
                    if(mer.length>1) {
                        var d=mer[mer.length-1]-mer[mer.length-2];
                        if(mer[mer.length-1]>100 && mer[mer.length-1]<201) {
                            current_gene_coeff=d/100;
                        } else {
                            current_gene_length+=(50*d);
                        }
                        //body_segments.push({'i':mer.length-1,'l':mer[mer.length-2],'r':mer[mer.length-1]});
                    }
                }
                console.log('coeff & len=',current_gene_coeff,current_gene_length,'mer=',mer);

                sarray = marray.map(function (d,j) {
                    var s = 0.0;
                    var r=0;
                    for (var i = nl; i < nr; i++)
                        s += d[i];
                    return (s/k )/(current_gene_length+glengths[j]*current_gene_coeff);
                }).sort(d3.ascending);
                //continue;
            }

            var id = stordata.get('pltname');
            var rarray = {};
            var precis = this.doPrecision(sarray[sarray.length - 1] / kdiv);

            rarray['id'] = id;
            rarray['raw'] = sarray;
            rarray['k'] = k;
            rarray['Q1'] = (d3.quantile(sarray, 0.25) / kdiv).toFixed(precis[1]);
            rarray['Q3'] = (d3.quantile(sarray, 0.75) / kdiv).toFixed(precis[1]);
            rarray['med'] = (d3.median(sarray) / kdiv).toFixed(precis[1]);
            rarray['mean'] = (d3.mean(sarray) / kdiv).toFixed(precis[1]);
            rarray['min'] = (sarray[0] / kdiv).toFixed(precis[1]);
            rarray['max'] = (sarray[sarray.length - 1] / kdiv).toFixed(precis[1]);
            var iq = this.iqr(1.5, sarray, rarray['Q1'], rarray['Q3'], rarray['min'], rarray['max']);
            rarray['lW'] = iq[0];
            rarray['rW'] = iq[1];
            //if (min > rarray[id]['min']) min = rarray[id]['min'];
            //if (max < rarray[id]['max']) max = rarray[id]['max'];
            darray.push(rarray);
        }

        var store = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id', type: 'string'},
                {name: 'min', type: 'float'},
                {name: 'max', type: 'float'},
                {name: 'mean', type: 'float'},
                {name: 'Q1', type: 'float'},
                {name: 'med', type: 'float'},
                {name: 'Q3', type: 'float'},
                {name: 'lW', type: 'float'},
                {name: 'rW', type: 'float'}
            ],
            data: darray
        });
        var html = this.pairwise(darray);

        var win = Ext.create("EMS.view.Project2.ATDPBPWindow");
        win.add({
                    xtype: 'qcboxplot',
                    title: '',
                    store: store,
                    xAxisName: '',
                    yAxisName: 'Reads Density',
                    flex: 4
                });
        win.add({
                    xtype: 'splitter'
                });
        win.add({
                    xtype: 'panel',
                    title: '',
                    collapsible: true,
                    collapsed: false,
                    border: false,
                    minWidth: 50,
                    minHeight: 50,
                    margin: 0,
                    //layout: {
                    //    type: 'fit'
                    //},
                    flex: 1,
                    //bodyStyle: 'padding-bottom:15px;background:#eee;',
                    autoScroll: true,
                    //xtype: 'label',
                    html: html
                });

        win.show();

    },

    pairwise: function (data, func) {
        var html = "";
        var head = "<tr><td>&nbsp;</td>";
        for (var i = 0; i < data.length - 1; i++) {
            html += "<tr><td>" + data[i]['id'] + "</td>";
            for (var c = 0; c < i; c++) {
                html += "<td>&nbsp;</td>";
            }
            for (var j = i + 1; j < data.length; j++) {
                if (i == 0) head += '<td>' + data[j]['id'] + "</td>";

                var w = this.wilcoxon(data[i]['raw'], data[j]['raw']);
                //var pr=this.doPrecision(w[0]);
                html += '<td align="right">' + w[0].toExponential(2) + "</td>";

                console.log(data[i]['id'] + ' vs ' + data[j]['id'], w);
            }
            html += "</tr>";
        }
        html = '<table border="0" class="panel-text">' + head + "</tr>" + html + "</table>";
        return html;
    },

    wilcoxon: function (seta, setb) {
        var alen = seta.length;
        var blen = setb.length;
        var i = 0, j = 0;
        var ranka = 0, rankb = 0;
        var tiecorr = 0;

        while ((i < seta.length) && (j < setb.length)) {
            if (seta[i] < setb[j]) {
                i++;
                ranka += (i + j);
            } else if (seta[i] > setb[j]) {
                j++;
                rankb += (j + i);
            } else if (seta[i] == setb[j]) {
                var dev = 2;
                var startra = i, startrb = j;
                var rank = (i + j + 1);
                var sumrank = rank * 2 + 1;
                ++rank;
                var val = seta[i];
                while (++i < seta.length && seta[i] == val) {
                    dev++;
                    sumrank += (++rank);
                }
                while (++j < setb.length && setb[j] == val) {
                    dev++;
                    sumrank += (++rank);
                }
                var averrank = sumrank / dev;
                ranka += (averrank * (i - startra));
                rankb += (averrank * (j - startrb));
                tiecorr += (dev * dev * dev - dev);
            }
        }
        while (i < seta.length) {
            i++;
            ranka += (i + j);
        }
        while (j < setb.length) {
            j++;
            rankb += (i + j);
        }

        var totrank = (alen + blen) * (alen + blen + 1) / 2;

        var gu = alen * blen;
        var tlen = alen + blen;
        var Ua = gu + alen * (alen + 1) / 2 - ranka;
        var Ub = gu + blen * (blen + 1) / 2 - rankb;
        var U = 0;
        var mu = gu / 2;
        var Z = 0;
        if (Ua < Ub) {
            U = Ub;
        } else {
            U = Ua;
        }
        var sigma = 0;

        if (tiecorr == 0) {
            sigma = Math.sqrt(gu * (tlen + 1) / 12);
            Z = (U - mu) / sigma;
        } else {

            sigma = Math.sqrt(gu * (tlen + 1) / 12 - gu * tiecorr / (12 * (tlen * (tlen - 1))));
            Z = (U - mu) / sigma;
        }

        //var Pa = this.gaussian_tail_weight(Za);
        //var Pb = this.gaussian_tail_weight(Zb);
        //var Pa = this.pnorm(Za);
        //var Pb = this.pnorm(Zb);

        var P = this.pnorm(Z);
        console.log('wilc debug', {
            'U': U,
            'Z': Z,
            'P': P,
            'tiecorr': tiecorr,
            'n1': alen,
            'n2': blen,
            'seta': seta.join(),
            'setb': setb.join()
        });
        return [P * 2];
    },
    /*************************************************************
     *************************************************************/
    doPrecision: function (MAX) {
        var dec = Math.floor(-Math.log(Math.abs(MAX) > 1 ? 0.1 : Math.abs(MAX)) / Math.LN10) + 1;
        var power = Math.pow(10, dec);
        var entire = Math.floor(MAX * power) + 1;
        return [entire / power, dec + 1, power];

    },
    n: function (x) {

        var A = 1.0 / Math.sqrt(2.0 * Math.PI);
        return A * Math.exp(-x * x * 0.5);

    },
    gaussian_tail_weight: function (x) {

        // Zelen and Severo (1964):
        // Φ(x) ≈ 1 − (0.4361836t − 0.1201676t2 + 0.9372980t3)*sqrt(1/2π)*exp( (−x^2)/2)
        // where t = (1 + 0.33267x)−1.

        var a1 = 0.4361836;
        var a2 = -0.1201676;
        var a3 = 0.9372980;

        x = Math.abs(x);
        var k = 1.0 / (1.0 + (0.33267 * x));

        return this.n(x) * (a1 * k + (a2 * k * k) + (a3 * k * k * k));
    },

    log_gaussian_tail_weight: function (xi) {
        var a1 = 0.4361836;
        var x = Math.abs(xi);
        if (x >= 3) {
            //return lognx + log(a1) + log(k);
            return (-0.5 * Math.log(2.0 * 3.1415) - x * x * 0.5 ) + Math.log(a1) - Math.log(1.0 + 0.33267 * x);
        }
        return Math.log(this.gaussian_tail_weight(x));
    },

    pnorm: function (x) {
        //Byrc (2001B):
        var A = (x * x + 5.575192695 * x + 12.77436324) / (x * x * x * Math.sqrt(2 * Math.PI) + 14.38718147 * x * x + 31.53531977 * x + 25.548726);
        A = A * Math.exp(-x * x * 0.5);
        return A;

    },

    /*************************************************************
     *************************************************************/
    ATDPHview: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid, tabs) {
        var me = this;
        var stor = this.getATDPHeatAStore();
        stor.getProxy().setExtraParam('id', record.data['item_id']);
        var tabadded = tabs.add({xtype: 'panel', title: 'Tag Density Heatmap'});
        tabadded.setDisabled(true);
        tabadded.setIconCls('loading');

        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              tabs.remove(tabadded);
                              tabs.add(Ext.create("EMS.view.Project2.ATDPBChart",
                                                  {
                                                      store: stor,
                                                      mask: 'horizontal',
                                                      listeners: {
                                                          select: {
                                                              scope: me,
                                                              fn: me.doWilcoxonMB
                                                          }
                                                      }

                                                  }));
                              tabs.add(Ext.create("EMS.view.Project2.ATDPHChart", {store: stor}));
                          }
                      }
                  });
    },


    TableView: function (grid, rowIndex, colIndex, actionItem, event, record, row, atypeid) {
        var stor = this.getTableViewStore();
        stor.getProxy().setExtraParam('id', record.data['item_id']);
        stor.load({
                      callback: function (records, operation, success) {
                          if (success) {
                              var window = Ext.create("EMS.view.Project2.TableViewWindow", {store: stor});
                              window.show();
                          }
                      }
                  });
    },


    ongbjump: function (button, panel) {
        //console.log('gbjump',button,panel);
        var grid = button.up('panel').down('grid');
        var model = grid.getSelectionModel().getSelection();
        if (model.length < 1) {
            return;
        }
        var start = 0;
        var end = 0;
        if (typeof(model[0].data['start']) !== 'undefined') {
            start = model[0].data['start'];
            end = model[0].data['end'];
        }
        if (typeof(model[0].data['txStart']) !== 'undefined') {
            start = model[0].data['txStart'];
            end = model[0].data['txEnd'];
        }
        var stor = this.getTableViewStore();
        var gblink = stor.getProxy().getReader().jsonData.gblink;

        console.log(gblink);
        console.log('start=', start, ' end=', end);

        //var url = GENOME_BROWSER_IP+'/cgi-bin/hgTracks?pix=1050&refGene=full&' + gblink;
        //url = url + '&position=' + model[0].data['chrom'] + ':' + start + "-" + end;
        //window.open(url, gblink);
    }
});

