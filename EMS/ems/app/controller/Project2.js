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

    //Ext.Loader.setPath({'EMS': 'app'}, {'Ext.ux': 'ux'});

Ext.define('EMS.controller.Project2', {
    extend: 'Ext.app.Controller',
    models: ['ProjectLabData', 'Worker', 'RPKM', 'RType', 'AType', 'ProjectTree', 'GeneList', 'PCAChart', 'ATPChart'],
    stores: ['ProjectLabData', 'Worker', 'RPKM', 'RType', 'AType', 'ProjectTree', 'GeneList', 'PCAChart', 'ATPChart'],
    views: ['Project2.ProjectDesigner', 'Project2.GenesLists', 'Project2.Filter', 'Project2.DESeq', 'charts.ATP'],
    init: function () {
        var me = this;
        me.atype = undefined;
        me.control({
            'ProjectDesigner': {
                render: me.onProjectDesignerWindowRendered,
                startAnalysis: me.startAnalysis,
                projectAdd: me.onProjectAdd
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
            '#project2-project-list': {
                select: me.onProjectSelect,
                edit: me.onProjectEdit
            },
            '#project-worker-changed': {
                select: me.onComboboxWorkerSelect
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
    }, //init
    onProjectDesignerWindowRendered: function (view) {
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
        var uuid = generateUUID();

        var r = Ext.create('EMS.model.ProjectTree', {
            id: uuid,
            text: name,
            name: name,
            dateadd: Ext.Date.format(new Date(), 'm/d/Y'),
            type: 0,
            isnew: 1,
            leaf: false,
            expanded: true
        });
        store.getRootNode().appendChild(r);
        store.sync();
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
            var worker = this.getWorkerStore().findRecord('id', record.get('worker_id'), 0, false, false, true).data.fullname;

            detp.expand();
            var bd = detp.body;
            bd.update('').setStyle('background', '#fff');

            mainPanel.restoreCenter();
            if (!me.atype) {
                me.atype = me.getATypeStore();
                me.atype.load({
                    callback: function (records, operation, success) {
                        if (success) {
                            me.UpdateAddAnalysis(records, record);
                        }
                    }});
            } else {
                me.UpdateAddAnalysis(me.atype.data.items, record);
            }
            detp.getEl().slideIn('b', {
                easing: 'easeInOut',
                duration: 500,
                stopAnimation: true
            });
            bd.setHTML('<div style="padding:5px;">&nbsp;Project by: <b>' + worker + '</b><br>' + '&nbsp;Project date: <b>' + Ext.util.Format.date(record.get('dateadd'), 'm/d/Y') + '</b><br>' + '&nbsp;Description: <br>&nbsp;<i>' + record.get('description') + '</i><br>' + '</div>');
        }//if project
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
        //var RTypeStore=me.getRTypeStore();
        var labStore = me.getProjectLabDataStore();
        var centralPan;

        switch (data.atypeid) {
            case 1://DEseq
            case 6://GeneList
                labStore.getProxy().setExtraParam('isrna', 1);
                labStore.load();
                resStore.getProxy().setExtraParam('projectid', data.projectid);
                resStore.getProxy().setExtraParam('atypeid', data.atypeid);
                resStore.load();
                if (data.atypeid === 1) {
                    centralPan = Ext.create('EMS.view.Project2.DESeq', {
                        labDataStore: labStore,
                        resultStore: resStore,
                        projectid: data.projectid
                    });
                } else {
                    centralPan = Ext.create('EMS.view.Project2.GenesLists', {
                        labDataStore: labStore,
                        resultStore: resStore,
                        projectid: data.projectid
                    });
                }
                break;
            case 2://PCA
                break;
            case 3://DESeq2
                break;
            case 4://ATP
                break;
            case 5://MANorm
                break;

                break;
        }
        mainPanel.replaceCenter(centralPan);
    },
    /*************************************************************
     *************************************************************/
    onComboboxWorkerSelect: function (combo, records, options) {
        this.getProjectLabDataStore().getProxy().setExtraParam('workerid', Ext.getCmp('project-worker-changed').getValue());
        Ext.getCmp('Project2GenesLists').m_PagingToolbar.moveFirst()
    },
    /*************************************************************
     *************************************************************/
    beforeGeneListDrop: function (node, data, overModel, dropPosition, dropHandlers) {
        var me = this;
        dropHandlers.wait = true;

        if ((dropPosition !== 'append' && overModel.data.leaf === false) || overModel.data.id === 'gl' || overModel.data.root === true) {
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

                var uuid = generateUUID();

                if (typeof data.records[i].data.name4browser !== 'undefined') {
                    data.records[i].set('name', data.records[i].data.name4browser);
                    data.records[i].set('item_id', uuid);
                    data.records[i].set('labdata_id', data.records[i].data.id);
                    data.records[i].set('project_id', me.projectid);
                    data.records[i].set('expanded', false);
                    data.records[i].set('isnew', true);
                } else {
                    data.records[i].set('item_id', data.records[i].data.id);
                    data.records[i].set('isnew', false);
                }
                data.records[i].set('parent_id', overModel.data.id);
                data.records[i].set('leaf', true);
                data.records[i].set('type', 1);
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
        var uuid = generateUUID();
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
    runDESeq: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
        var me = this;
        var filterForm = Ext.create('EMS.view.Project2.DESeqRun', {
            modal: true,
            item_id: record.data.item_id,
            tables: me.getGeneListStore().getRootNode(),
            onSubmit: function () {
                me.deseqSubmit(filterForm, record);
            }
        }).show();
    },
    deseqSubmit: function (form, record) {
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
                    Logger.log("Cant run deseq, error: " + json.message);
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
                Logger.log("Cant run deseq, error");
                form.close();
            },
            jsonData: Ext.encode({
                "project_id": me.projectid,
                "atype_id": 1,
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
            localid: LocalStorage.FILTER_DESEQ,
            onSubmit: function () {
                me.filterSubmitDeseq(filterForm, record);
            }
        }).show();

    },
    filterSubmitDeseq: function (form, record) {
        var me = this;
        var uuid = generateUUID();
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
                    Logger.log("Cant add filter error: " + json.message);
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
            localid: LocalStorage.FILTER_STORAGE,
            onSubmit: function () {
                me.filterSubmit(filterForm, record);
            }
        }).show();

    },
    filterSubmit: function (form, record) {
        var me = this;
        var uuid = generateUUID();
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
                    Logger.log("Cant add filter error: " + json.message);
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
        if (record.get('parentId') === 'gl' || record.get('parentId') === 'de') {
            panel.expand();
            bd.update('').setStyle('background', '#fff');
            bd.setHTML('<div style="margin-right:5px; color: #04408C; margin-left: 5px; align: left; padding: 0; line-height:1.5em; height: 100%;">' + 'Conditions:' + '<div class="panel-text">' + record.get('conditions') + '</div></div>');
        } else {
            panel.collapse();
        }
    }
});

