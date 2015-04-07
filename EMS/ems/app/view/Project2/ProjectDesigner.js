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
    alias: 'widget.ProjectDesigner',
    id: 'ProjectDesigner',
    width: 1100,
    height: 700,
    minWidth: 300,
    minHeight: 300,
    title: 'Project designer',
    closable: true,
    maximizable: true,
    closeAction: 'hide',
    //constrain: true,
    iconCls: 'default',
    curColumn: 1,
    curRow: 1,
    maxColumn: 2,
    localdata: {
        analysisPanelList: [],
        central: {},
        centerhided: false
    },
    layout: {
        type: 'border'
    },
    initComponent: function () {
        var me = this;

        me.addEvents('startAnalysis');

        me.items = [
            {
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                region: 'west',
                border: false,
                frame: false,
                split: true,
                title: 'Projects',
                margins: '2 0 5 5',
                width: 290,
                items: [
                    {
                        xtype: 'textfield',
                        id: 'project2-project-name',
                        emptyText: 'Type project name, press enter to add',
                        margin: "5 0 5 0",
                        enableKeyEvents: true,
                        listeners: {
                            specialkey: function (field, event) {
                                if (event.getKey() === event.ENTER) {
                                    me.fireEvent('projectAdd');
                                }
                            }
                        }
                    } ,
                    {
                        id: 'project2-project-list',
                        xtype: 'treepanel',
                        flex: 2,
                        rootVisible: false,
                        store: 'ProjectTree',
                        hideHeaders: true,
                        selType: 'cellmodel',
                        viewConfig: {
                            toggleOnDblClick: false
                        },
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 2
                            })
                        ],
                        columns: [
                            {
                                xtype: 'treecolumn',
                                flex: 1,
                                //minWidth: 150,
                                dataIndex: 'text',
                                editor: {
                                    xtype: 'textfield',
                                    allowBlank: false
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'splitter'
                    },
                    {
                        xtype: 'panel',
                        id: 'project2-details-panel',
                        title: 'Details',
                        bodyStyle: 'padding-bottom:15px;background:#eee;',
                        autoScroll: true,
                        collapsible: true,
                        collapsed: true,
                        minHeight: 100,
                        flex: 1,
                        html: '<p class="details-info">To start working with project designer. Please select project your want to work with or type a new project name then press enter.</p>'
                    }
                ]
            },
            {
                xtype: 'panel',
                id: 'project2-center-panel',
                region: 'center',
                frame: true,
                padding: 0,
                layout: 'fit',
                items: [
                    {
                        xtype: 'panel',
                        id: 'project2-content-panel',
                        layout: {
                            type: 'table',
                            columns: me.maxColumn,
                            tableAttrs: {
                                style: {
                                    width: 780
                                }
                            }
                        },
                        border: false,
                        items: [
                            {
                                xtype: 'panel',
                                margin: 10,
                                padding: 0,
                                draggable: false,
                                border: false,
                                minWidth: 370,
                                minHeight: 80,
                                //id: 'project2-analysis-' + data.id,
                                colspan: 2,
                                frame: true,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                bodyStyle: 'background: #dfe9f6',
                                items: [
                                    {
                                        xtype: 'container',
                                        flex: 1,
                                        minHeight: 50,
                                        layout: {
                                            type: 'hbox',
                                            align: 'stretch'
                                        },
                                        items: [
                                            {
                                                flex: 1,
                                                xtype: 'label',
                                                html: '<div class="panel-text">' + '<img src="images/about_big.png" width=40 height=40 align=left>&nbsp;&nbsp;&nbsp;&nbsp;' +
'To add a new project, type project name in a field, which is in the top left corner of the window and press enter. New project name will be shown in the left panel. Select it  and available analyses will appear. </div>'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                margins: '2 5 5 0',
                border: true
            }
        ];
        this.callParent(arguments);
    },
    restoreCenter: function () {
        var me = this;
        var center = Ext.getCmp('project2-center-panel');
        if (me.localdata.centerhided) {
            me.localdata.centerhided = false;
            center.getComponent(1).getEl().slideOut('l', {
                easing: 'easeInOut',
                duration: 500,
                stopAnimation: true,
                listeners: {
                    'lastframe':function() {
                        center.getComponent(0).getEl().slideIn('l', {
                            easing: 'easeInOut',
                            duration: 500,
                            stopAnimation: true
                        });
                        center.getComponent(0).setVisible(true);
                        center.remove(center.getComponent(1));
                    }
                }
            });
        }
    },
    replaceCenter: function (panel) {
        var me = this;
        var center = Ext.getCmp('project2-center-panel');
        if (!me.localdata.centerhided) {
            me.localdata.centerhided = true;
            me.localdata.central = Ext.getCmp('project2-content-panel');
            center.getComponent(0).setVisible(false);
            //            center.getComponent(0).getEl().slideOut('l', {
            //                easing: 'easeInOut',
            //                duration: 1000,
            //                remove: false,
            //                stopAnimation: true
            //            });
//            panel.setVisible(false);
            center.add(panel);
//            center.getComponent(1).getEl().slideIn('l', {
//                easing: 'easeInOut',
//                duration: 500,
//                remove: false,
//                stopAnimation: true
//            });
//            panel.setVisible(true);
        }
    },
    hideAnalysis: function () {
        var me = this;
        for (var i = 0; i < me.localdata.analysisPanelList.length; i++) {
            var exist = Ext.getCmp(me.localdata.analysisPanelList[i]);
            if (exist) {
                var slide = 'l';
                exist.getEl().slideOut(slide, {
                    easing: 'easeInOut',
                    duration: 500,
                    stopAnimation: true
                });
            }
        }
    },
    showAnalysis: function () {
        var me = this;
        for (var i = 0; i < me.localdata.analysisPanelList.length; i++) {
            var exist = Ext.getCmp(me.localdata.analysisPanelList[i]);
            if (exist) {
                var slide = 't';
                exist.getEl().slideIn(slide, {
                    easing: 'easeInOut',
                    duration: 200,
                    stopAnimation: true
                });
            }
        }
    },
    addAnalysis: function (data) {
        var me = this;
        var panel = Ext.getCmp('project2-content-panel');
        var exist = Ext.getCmp('project2-analysis-' + data.id);
        if (exist) {
            var x = exist.getX();
            var y = exist.getY();
            exist.projectid = data.prjid;
            var slide = 't';
            var from = {
                x: x,
                y: y,
                height: 30
            };
            var to = {
                x: x,
                y: y,
                height: 160
            };

            exist.getEl().slideIn(slide, {
                easing: 'linear',
                duration: 300,
                remove: false,
                //preserveScroll: true,
                //stopAnimation: true,
                to: to,
                from: from

            });
            return;
        }

        me.localdata.analysisPanelList.push('project2-analysis-' + data.id);
        var element = {
            xtype: 'panel',
            minWidth: 370,
            minHeight: 160,
            id: 'project2-analysis-' + data.id,
            projectid: data.prjid,
            column: me.curColumn,
            columnWidth: 380,
            margin: 10,
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
                'render': function (panel) {
                    panel.body.on('click', function () {
                        me.fireEvent('startAnalysis', {projectid: panel.projectid, atypeid: data.id});
                    });
                    panel.body.on('mouseover', function () {
                        panel.setBodyStyle('background', '#bed3ef');
                    });
                    panel.body.on('mouseout', function () {
                        panel.setBodyStyle('background', '#dfe9f6');
                    });
                }
            },
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    minHeight: 50,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'image',
                            maxWidth: 40,
                            maxHeight: 40,
                            margin: 5,
                            src: data.imgsrc
                        },
                        {
                            xtype: 'label',
                            flex: 1,
                            html: '<div style="text-align: center; font-size: 200%; color:#04408C;">&nbsp;' + data.name + '</div>'
                        }
                    ]
                },
                {
                    flex: 2,
                    xtype: 'label',
                    html: '<div class="panel-text">&nbsp;&nbsp;&nbsp;&nbsp;' + data.description + '</div>'
                }
            ]
        };
        panel.add(element);

        if (me.curColumn === me.maxColumn) {
            me.curColumn = 1;
            me.curRow++;
        } else {
            me.curColumn++;
        }

    }

});
