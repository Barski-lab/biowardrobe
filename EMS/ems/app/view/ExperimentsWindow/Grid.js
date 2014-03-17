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
Ext.require('EMS.model.Worker');

Ext.define('EMS.view.ExperimentsWindow.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.ExperimentsWindowGrid',

    border: false,
    columnLines: true,
    frame: false,
    remoteSort: true,
    id: 'ExperimentsWindowGrid',

    initComponent: function () {
        var me = this;

        var filters = {
            ftype: 'filters',
            encode: true, // json encode the filter query
            local: false   // defaults to false (remote filtering)
        };

        me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
            store: EMS.store.LabData,
            margin: '0 5 0 5',
            displayInfo: true
        });

        Ext.apply(me, {
            store: EMS.store.LabData,

            features: [filters],
            viewConfig: {
                enableTextSelection: false
            },
            columns: [
                {   header: "Record ID", sortable: true, width: 60, dataIndex: 'id'                                     },
                {   header: "Belongs to", sortable: true, width: 85, dataIndex: 'worker_id', hidden: true,
                    renderer: function (value, meta, record) {
                        var rec = EMS.store.Worker.findRecord('id', value, 0, false, false, true);
                        return rec ? rec.data.fullname : '';
                    }
                },
                {   header: "Genome", sortable: true, width: 80, dataIndex: 'genome_id',
                    renderer: function (value, meta, record) {
                        var rec = EMS.store.Genome.findRecord('id', value, 0, false, false, true);
                        return rec ? rec.data.genome : '';
                    }
                },
                {   header: "Type", sortable: true, width: 90, dataIndex: 'experimenttype_id', filterable: true,
                    renderer: function (value, meta, record) {
                        var rec = EMS.store.ExperimentType.findRecord('id', value, 0, false, false, true);
                        return rec ? rec.data.etype : '';
                    }
                },
                {   header: "Cells", sortable: true, width: 230, dataIndex: 'cells',
                    filterable: true,
                    filter: {
                        type: 'string'
                    }
                },
                {   header: "Condition", sortable: true, width: 380, dataIndex: 'conditions',
                    filterable: true,
                    filter: {
                        type: 'string'
                    }
                },
                {   header: "Name for browser", sortable: true, width: 160, dataIndex: 'name4browser',filterable: true},
                {   header: "File template", sortable: true, width: 60, dataIndex: 'url', hidden: true,},
                {   header: "Mapped", sortable: false, width: 50, dataIndex: 'tagspercent',align: 'right'},
                {   header: "Islands count", sortable: true, width: 90, dataIndex: 'islandcount',align: 'right'},
                {
                    header: "status", sortable: false, width: 60,
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    items: [
                        {
                            getClass: function (v, meta, rec) {
                                var sts = rec.get('libstatus');
                                var base = (sts / 1000) | 0;
                                sts = sts % 1000;
                                if (sts < 10) {
                                    this.items[0].tooltip = rec.get('libstatustxt');
                                    return 'data-' + base.toString() + '-' + sts.toString();
                                } else {
                                    this.items[0].tooltip = 'complete';
                                    return 'data-0-2';
                                }
                            }
                        } ,
                        {
                            getClass: function (v, meta, rec) {
                                var sts = rec.get('libstatus');
                                var base = (sts / 1000) | 0;
                                sts = sts % 1000;
                                if (sts < 20 && sts >= 10) {
                                    this.items[1].tooltip = rec.get('libstatustxt');
                                    return 'gear-' + base.toString() + '-' + sts.toString();
                                } else if (sts >= 20) {
                                    this.items[1].tooltip = 'complete';
                                    return 'gear-0-12';
                                }
                            }
                        },
                        {
                            getClass: function (v, meta, rec) {
                                var sts = rec.get('libstatus');
                                var base = (sts / 1000) | 0;
                                sts = sts % 1000;
                                if (sts < 30 && sts >= 20) {
                                    this.items[2].tooltip = rec.get('libstatustxt');
                                    return 'step-' + base.toString() + '-' + sts.toString();
                                } else if (sts >= 30) {
                                    this.items[2].tooltip = 'complete';
                                    return 'step-0-22';
                                }
                            }
                        }
                    ]

                },
                {   header: "Date", sortable: true, width: 70, dataIndex: 'dateadd',
                    renderer: Ext.util.Format.dateRenderer('m/d/Y'), filter: true
                },
                {
                    xtype: 'actioncolumn', sortable: false, width: 55,
                    menuDisabled: true,
                    items: [
                        {
                            getClass: function (v, meta, rec) {
                                this.items[0].tooltip = 'Duplicate record';
                                if (parseInt(rec.raw['worker_id']) === parseInt(USER_ID) || Rights.check(USER_ID, 'ExperimentsWindow')) {
                                    this.items[0].handler = function (grid, rowIndex, colIndex) {
                                        var data = EMS.store.LabData.getAt(rowIndex).raw;

                                        var r = Ext.create('EMS.model.LabData', {
                                            worker_id: USER_ID,
                                            fragmentsizeexp: 150,
                                            browsershare: false,
                                            genome_id: data['genome_id'],
                                            crosslink_id: data['crosslink_id'],
                                            fragmentation_id: data['fragmentation_id'],
                                            antibody_id: data['antibody_id'],
                                            experimenttype_id: data['experimenttype_id'],
                                            cells: data['cells'],
                                            conditions: data['conditions'],
                                            spikeinspool: data['spikeinspool'],
                                            spikeins: data['spikeins'],
                                            notes: data['notes'],
                                            protocol: data['protocol'],
                                            browsergrp: data['browsergrp'],
                                            libstatus: 0,
                                            libstatustxt: 'new',
                                            dateadd: data['dateadd']
                                        });
                                        EMS.store.LabData.insert(rowIndex + 1, r);
                                    }
                                    return 'table-row-add';
                                }
                            }
                        } ,
                        {
                            getClass: function (v, meta, rec) {
                                this.items[1].tooltip = '';
                                return 'space';
                            }
                        } ,
                        {
                            getClass: function (v, meta, rec) {
                                this.items[2].tooltip = 'Delete record';
                                if (parseInt(rec.raw['worker_id']) === parseInt(USER_ID) || Rights.check(USER_ID, 'ExperimentsWindow')) {
                                    this.items[2].handler = function (grid, rowIndex, colIndex) {
                                        var sts = EMS.store.LabData.getAt(rowIndex).raw['libstatus'];
                                        sts = sts % 1000;
                                        if (sts > 1) {
                                            Ext.Msg.show({
                                                             title: 'Can\'t delete',
                                                             msg: 'Deletion of processed data is not implemented yet.',
                                                             icon: Ext.Msg.INFO,
                                                             buttons: Ext.Msg.OK
                                                         });
                                        } else {
                                            EMS.store.LabData.removeAt(rowIndex);
                                        }

                                    }
                                    return 'table-row-delete';
                                }
                            }
                        }
                    ]
                }
            ],//columns

            tbar: [
                {
                    text: 'New',
                    iconCls: 'table-row-add',
                    tooltip: 'Describe a new experiment',
                    id: 'new-experiment-data'
                } ,
                {
                    text: 'Save',
                    iconCls: 'table2-check',
                    tooltip: 'Save changes',
                    handler: function () {
                        EMS.store.LabData.sync({
                                                   success: function (batch, options) {
                                                       Ext.Msg.show({
                                                                        title: 'Data saved',
                                                                        msg: 'Records successfully stored',
                                                                        icon: Ext.Msg.INFO,
                                                                        buttons: Ext.Msg.OK
                                                                    });
                                                   }
                                               });
                    }
                },
                '-' ,
                me.m_PagingToolbar,
                '-' ,
                {
                    xtype: 'combobox',
                    id: 'labdata-grid-user-filter',
                    displayField: 'fullname',
                    margin: '0 5 0 5',
                    editable: false,
                    width: 200,
                    valueField: 'id',
                    value: USER_ID,
                    store: EMS.store.Worker
                } ,
                {
                    xtype: 'tbfill'
                } ,
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'button',
                            text: 'save table',
                            align: 'right',
                            width: 80,
                            submitValue: false,
                            iconCls: 'disk',
                            margin: '0 5 0 5',
                            handler: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
                                window.location = "data/csv.php?tablename=labdata";
                            }
                        }
                    ]
                }


            ]//tbar

        });  //grid/paging.js

        this.callParent(arguments);
    }
});//grid

