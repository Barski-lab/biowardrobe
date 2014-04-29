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
                'Ext.ux.IFrame'
            ]);


Ext.define('EMS.controller.EMSMenu', {
    extend: 'Ext.app.Controller',

    views: ['EMSViewport', 'toolbar.EMSMenu'],
    stores: ['Worker'],
    //local variables
    windowList: new Array(),
    worker: {},

    init: function () {
        this.control({
                         'EMSMenu menuitem': {
                             click: this.onEMSMenuForms
                         }
                     });
        this.worker = this.getWorkerStore().getAt(0);
        this.addAdminMenu();
    },

    //-----------------------------------------------------------------------
    //
    //
    //-----------------------------------------------------------------------
    addAdminMenu: function () {
        var emsmenu = Ext.ComponentQuery.query('viewport EMSMenu')[0];
        admmenu = {
            xtype: 'button',
            text: 'Wardrobe',
            tooltip: 'Wardrobe administration and preferences',
            iconCls: 'preferences-edit',
            menu: []
        };
        if (this.worker.data.isa)
            admmenu.menu = [
                { text: 'Preferences', action: 'Preferences', tooltip: 'The system preferences', iconCls: 'gears-preferences'},
                { text: 'Users & Groups', action: 'UsersGroups', tooltip: 'Edit users and groups', iconCls: 'users3-edit'},
                '-'
            ];
        if (this.worker.data.isla)
            admmenu.menu = [
                { text: 'Users & Groups', action: 'UsersGroups', tooltip: 'Edit users and groups', iconCls: 'users3-edit'},
                '-'
            ];
        admmenu.menu.push({ text: 'Personal settings', action: 'Worker', tooltip: 'Password changing, notification and other...', iconCls: 'user-preferences'});
        emsmenu.insert(0, admmenu);
    },

    //-----------------------------------------------------------------------
    //
    //
    //-----------------------------------------------------------------------
    createWindow: function (WinVar, Widget, Params) {
        var me = this;

        if (!(WinVar in me.windowList) || me.windowList[WinVar] === 'undefined') {
            me.windowList[WinVar] = Ext.create(Widget, Params);

            Ext.ComponentQuery.query('viewport panel#windows')[0].add(me.windowList[WinVar]);

            me.windowList[WinVar].on('destroy', function () {
                me.windowList[WinVar] = 'undefined';
            });
        }

        if (me.windowList[WinVar].isVisible()) {
            me.windowList[WinVar].focus();
        } else {
            me.windowList[WinVar].show();
        }
    },
    //-----------------------------------------------------------------------
    //
    //
    //-----------------------------------------------------------------------
    onEMSMenuForms: function (menuitem, e, opt) {
        var me = this;

        switch(menuitem.action) {
            case "Preferences":
                me.createWindow(menuitem.action, 'EMS.view.Preferences.Preferences', {});
                break;
            case "UsersGroups":
                me.createWindow(menuitem.action, 'EMS.view.user.UsersGroups', {});
                break;
            case "Worker":
                //me.WorkerEditWindow = me.getController('EMS.controller.WorkersEdit').edit();
                //Ext.ComponentQuery.query('EMSMenu')[0].add(me.WorkerEditWindow);
                break;
            case "LabData":
                me.createWindow(menuitem.action, 'EMS.view.Experiment.LabData.LabDataListWindow', {});
                break;
            case "ProjectDesigner2":
                me.createWindow(menuitem.action, 'EMS.view.Project2.ProjectDesigner', {});
                break;
            case "ExperimentGroups":
                me.createWindow(menuitem.action, 'EMS.view.Experiment.EGroup.EGroup', {});
                break;
            case "":
                break;
        }

        if (menuitem.action === "Antibodies") {
            me.createWindow(menuitem.action, 'EMS.view.Antibodies.Antibodies', {});
        }
        if (menuitem.action === "CrossType") {
            me.createWindow(menuitem.action, 'EMS.view.Crosslink.Crosslink', {});
        }
        if (menuitem.action === "FragmentType") {
            me.createWindow(menuitem.action, 'EMS.view.Fragmentation.Fragmentation', {});
        }
        if (menuitem.action === "SeqCut") {
            me.createWindow(menuitem.action, 'EMS.view.SequenceCutter.MainWindow', {});
        }
        if (menuitem.action === "ExpType") {
            me.createWindow(menuitem.action, 'EMS.view.ExperimentType.ExperimentType', {});
        }
        if (menuitem.action === "GenomeType") {
            me.createWindow(menuitem.action, 'EMS.view.Genome.Genome', {});
        }
        if (menuitem.action === "SuppInfo") {
            me.createWindow(menuitem.action, 'EMS.view.Info.Supplemental', {});
        }
        if (menuitem.action === "Help") {
            // me.createWindow(menuitem.action,'EMS.view.Project.Filter',{ahead_id: 0, analysis_id:129});
        }
        /*
         Create window for genome browser
         */
        if (menuitem.action === "GenomeBrowser") {
            var win = Ext.create('Ext.window.Window', {
                width: 1000,
                minWidth: 200,
                height: 600,
                title: 'Genome Browser',
                closable: true,
                maximizable: true,
                constrain: true,
                layout: 'fit',
                items: [
                    {
                        xtype: 'uxiframe',
                        src: 'http://'
                    }
                ]
            });

            Ext.ComponentQuery.query('EMSMenu')[0].add(win);
            win.show();
        }
    }
    //-----------------------------------------------------------------------
    //
    //
    //-----------------------------------------------------------------------

});
