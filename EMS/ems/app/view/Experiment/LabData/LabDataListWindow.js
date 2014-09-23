/****************************************************************************
 **
 ** Copyright (C) 2011-2014 Andrey Kartashov .
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

Ext.define('EMS.view.Experiment.LabData.LabDataListWindow', {
    extend: 'Ext.Window',
    alias: 'widget.experimentlistwindow',
    title: 'Laboratory data',
    closable: true,
    maximizable: true,
    maximized: true,
    //closeAction: 'hide',
    constrain: true,
    minWidth: 900,
    minHeight: 500,
    iconCls: 'table2',
    layout: 'fit',
    requires: [
        '*',
        'Ext.ux.grid.menu.ListMenu',
        'Ext.ux.grid.FiltersFeature',
        'EMS.util.ComponentColumn',
    ],
    items: [
        {
            xtype: 'grid',
            border: false,
            columnLines: true,
            frame: false,
            remoteSort: true,
            itemId: 'ExperimentsWindowGrid',
            store: 'LabData',
            features: [
                {
                    ftype: 'filters',
                    encode: true,
                    local: false
                }
            ],
            viewConfig: {
                enableTextSelection: false
            },
            columns: [
                {   header: "#", sortable: true, width: 60, dataIndex: 'id'                                   },
                {   header: "Author", sortable: true, width: 85, dataIndex: 'author', hidden: false, filterable: true,
                    renderer: function (value, metaData, record) {
                        metaData.css = 'multilineColumn';
                        return value;
                    }
                },
                {   header: "Genome", sortable: true, width: 80, dataIndex: 'genome_id', filterable: true,
                    filter: {
                        type: 'list',
                        labelField: 'genome',
                        phpMode: true,
                        store: Ext.getStore('Genome'),
                    },
                    renderer: function (value, meta, record) {
                        var rec = Ext.getStore('Genome').findRecord('id', value, 0, false, false, true);
                        return rec ? rec.data.genome : '';
                    }
                },
                {   header: "Type", sortable: true, width: 90, dataIndex: 'experimenttype_id', filterable: true,
                    filter: {
                        type: 'list',
                        phpMode: true,
                        labelField: 'etype',
                        store: Ext.getStore('ExperimentType')
                    },
                    renderer: function (value, meta, record) {
                        var rec = Ext.getStore('ExperimentType').findRecord('id', value, 0, false, false, true);
                        return rec ? rec.data.etype : '';
                    }
                },
                {   header: "Cells / Condition", sortable: true, width: 230, dataIndex: 'cells', filterable: true,
                    filter: {
                        type: 'string'
                    },
                    renderer: function (value, metaData, record) {
                        metaData.css = 'multilineColumn';
                        return Ext.String.format('<div><strong>{0}</strong><div style="display: block; text-align: justify; line-height:100%; text-indent:5px; font-size:90%; font-style:italic; color: #333;">{1}</div></div>', value, record.get('conditions') || "Unknown");
                    }

                },
                {   header: "Condition", sortable: true, width: 300, dataIndex: 'conditions', hidden: true,
                    filterable: true,
                    filter: {
                        type: 'string'
                    }
                },
                {   header: "Alias", sortable: true, width: 160, dataIndex: 'name4browser', filterable: true,
                    filter: {
                        type: 'string'
                    },
                    renderer: function (value, metaData, record) {
                        metaData.css = 'multilineColumn';
                        return value;
                    }
                },
                {   header: "URL", sortable: true, width: 60, dataIndex: 'url', hidden: true, filterable: true,
                    filter: {
                        type: 'string'
                    },
                    renderer: function (value, metaData, record) {
                        metaData.css = 'multilineColumn';
                        return value;
                    }
                },

                { // chart column
                    xtype: 'componentcolumn',
                    text: 'Mapping statistics',
                    width: 70,
                    dataIndex: 'tagstotal',
                    align: 'center',
                    items: function (value, record, rowIndex) {
                        if (value == 0) return {};

                        var etype = Ext.getStore('ExperimentType').findRecord('id', record.data['experimenttype_id'], 0, false, false, true).data.etype;
                        var isRNA = (etype.indexOf('RNA') !== -1);

                        //var colors = ['rgb(47, 162, 223)',//BLUE
                        //              'rgb(60, 133, 46)',//green
                        //              'rgb(234, 102, 17)',//orange
                        //              'rgb(154, 176, 213)',//light blue
                        //              'rgb(186, 10, 25)',//red
                        //              'rgb(40, 40, 40)'];//black
                        //
                        //Ext.chart.theme.Statistics = Ext.extend(Ext.chart.theme.Base, {
                        //    constructor: function(config) {
                        //        Ext.chart.theme.Base.prototype.constructor.call(this, Ext.apply({
                        //                                                                            colors: colors
                        //                                                                        }, config));
                        //    }
                        //});
                        var store = Ext.create('Ext.data.ArrayStore', {
                            autoDestroy: true,
                            fields: [
                                {name: 'name',},
                                {name: 'percent', type: 'float'}
                            ],
                            data: [
                                [this.isRNA ? 'Transcriptome' : 'Mapped', record.data['tagsuniqpercent']],
                                ['Suppressed', record.data['tagsspercent']],
                                ['Unmapped', record.data['tagsupercent']],
                                [this.isRNA ? 'DNA Cont.' : 'Dublicates', record.data['tagsexpercent']],
                            ]
                        });

                        return {
                            xtype: 'chart',
                            animate: false,
                            height: 60,
                            width: 60,
                            padding: 0,
                            margin: 0,
                            store: store,
                            shadow: false,
                            border: false,
                            plain: true,
                            //                            layout: 'fit',
                            insetPadding: 5,
                            theme: 'Base:gradients',
                            series: [
                                {
                                    type: 'pie',
                                    field: 'percent',
                                    tips: {
                                        trackMouse: true,
                                        width: 120,
                                        height: 28,
                                        font: '9px Arial',
                                        renderer: function (storeItem, item) {
                                            this.setTitle(storeItem.get('name') + ': ' + storeItem.get('percent') + '%');
                                        }
                                    },
                                    label: {
                                        field: 'percent',
                                        display: 'rotate',
                                        contrast: true,
                                        font: '7px Arial'
                                    }
                                }
                            ]
                        }
                    }
                },

                {   header: "Mapped", sortable: false, width: 60, dataIndex: 'tagspercent', align: 'right', filterable: false, hidden: true},
                {   header: "Islands count", sortable: true, width: 60, dataIndex: 'islandcount', align: 'right', hidden: false,
                    renderer: function (value, metaData, record) {
                        if (value > 0) {
                            return Ext.String.format('<div>{0}</div>', value);
                        } else {
                            return "";
                        }
                    }
                },
                {
                    header: "status", sortable: false, width: 60, align: 'center',
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    items: [
                        {
                            getTip: function (v, meta, rec) {
                                return rec.get('libstatustxt');
                            },
                            getClass: function (v, meta, rec) {
                                var sts = rec.get('libstatus');
                                var base = (sts / 1000) | 0;
                                sts = sts % 1000;
                                var end = "2";
                                if (sts < 10) {
                                    end = sts.toString();
                                } else {
                                    base = 0;
                                }
                                return 'data-' + base.toString() + '-' + end;
                            }
                        } ,
                        {
                            getTip: function (v, meta, rec) {
                                return rec.get('libstatustxt');
                            },
                            getClass: function (v, meta, rec) {
                                var sts = rec.get('libstatus');
                                var base = (sts / 1000) | 0;
                                base = base > 2 ? 2 : base;
                                sts = sts % 1000;
                                if (sts < 20 && sts >= 10) {
                                    return 'gear-' + base.toString() + '-' + sts.toString();
                                } else if (sts >= 20) {
                                    return 'gear-0-12';
                                }
                            }
                        }
                        //                        {
                        //                            getClass: function (v, meta, rec) {
                        //                                var sts = rec.get('libstatus');
                        //                                var base = (sts / 1000) | 0;
                        //                                sts = sts % 1000;
                        //                                if (sts < 30 && sts >= 20) {
                        //                                    this.items[2].tooltip = rec.get('libstatustxt');
                        //                                    return 'step-' + base.toString() + '-' + sts.toString();
                        //                                } else if (sts >= 30) {
                        //                                    this.items[2].tooltip = 'complete';
                        //                                    return 'step-0-22';
                        //                                }
                        //                            }
                        //                        }
                    ]

                },
                {   header: "Date", sortable: true, width: 70, dataIndex: 'dateadd',
                    renderer: Ext.util.Format.dateRenderer('m/d/Y'), filter: true
                },
                {
                    xtype: 'actioncolumn', sortable: false, width: 75, menuDisabled: true, align: 'right',
                    items: [
                        {
                            tooltip: 'View record',
                            handler: function (view, rowIndex, colIndex, item, e, record) {
                                this.fireEvent('itemclick', this, 'view', view, rowIndex, colIndex, item, e, record);
                            },
                            iconCls: 'table2-view'
                        },
                        //                        {
                        //                            iconCls: 'space'
                        //                        } ,

                        {
                            tooltip: 'Duplicate record',
                            handler: function (view, rowIndex, colIndex, item, e, record) {
                                this.fireEvent('itemclick', this, 'duplicate', view, rowIndex, colIndex, item, e, record);
                            },
                            iconCls: 'tables'
                        } ,
                        //                        {
                        //                            iconCls: 'space'
                        //                        } ,
                        {
                            tooltip: 'Delete record',
                            isDisabled: function (view, rowIndex, colIndex, item, record) {
                                if (Ext.getStore('Worker').getAt(0).data['isa']) return false;
                                if (Ext.getStore('Worker').getAt(0).data['laboratory_id'] !=
                                    record.get('laboratory_id')) return true;
                                if (Ext.getStore('Worker').getAt(0).data['isla']) return false;
                                if (view.getStore().getAt(rowIndex).data['libstatus'] > 0) return true;
                                return false;
                            },
                            handler: function (view, rowIndex, colIndex, item, e, record) {
                                this.fireEvent('itemclick', this, 'delete', view, rowIndex, colIndex, item, e, record);
                            },
                            iconCls: 'table-row-delete'
                        }
                    ]
                }
            ],//columns

            tbar: [
                {
                    text: 'New',
                    iconCls: 'table-row-add',
                    tooltip: 'Add a new experiment',
                    itemId: 'newexperiment'
                } ,
                '-' ,
                {
                    xtype: 'pagingtoolbar',
                    store: 'LabData',
                    margin: '0 5 0 5',
                    displayInfo: true
                },
                '-' ,
                {
                    xtype: 'combobox',
                    itemId: 'laboratories',
                    tpl: '<tpl for="."><div class="x-boundlist-item" ><b>{name}</b><div style="display: block; text-align: justify; line-height:100%; font-size:80%; color: #449;"> {description}</div></div></tpl>',
                    margin: '0 5 0 5',
                    labelWidth: 110,
                    minWidth: 300,
                    displayField: 'name',
                    fieldLabel: 'Select by laboratory',
                    valueField: 'id',
                    store: 'Laboratories',
                    queryMode: 'local',
                    forceSelection: true,
                    editable: false
                } ,
                {
                    xtype: 'combobox',
                    itemId: 'projects',
                    tpl: '<tpl for="."><div class="x-boundlist-item" ><b>{name}</b><div style="display: block; text-align: justify; line-height:100%; font-size:80%; color: #449;"> {description}</div></div></tpl>',
                    margin: '0 5 0 5',
                    labelWidth: 110,
                    minWidth: 300,
                    displayField: 'name',
                    fieldLabel: 'Select by folder',
                    valueField: 'id',
                    queryMode: 'local',
                    forceSelection: true,
                    editable: false
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
                            minWidth: 75,
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
        }
    ]
})
;
