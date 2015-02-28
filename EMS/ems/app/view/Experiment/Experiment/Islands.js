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


Ext.define('EMS.view.Experiment.Experiment.Islands', {
    extend: 'Ext.Panel',
    alias: 'widget.experimentislands',
    frame: false,
    border: false,
    plain: true,
    layout: 'fit',
    title: 'Islands list',
    iconCls: 'table2',
    items: [
        {
            viewConfig: {
                stripeRows: true,
                enableTextSelection: true
            },
            xtype: 'grid',
            hight: 60,
            frame: false,
            border: false,
            plain: true,
            columnLines: true,
            store: 'Islands',
            remoteSort: true,
            features: [
                {
                    ftype: 'filters',
                    encode: true,
                    local: false
                }
            ],
            columns: [
                {header: 'refseq_id', sortable: true, filterable: true, width: 80, dataIndex: 'refseq_id'},
                {header: 'gene_id', sortable: true, filterable: true, width: 85, dataIndex: 'gene_id'},

                {header: 'txStart', sortable: true, filterable: true, width: 80, dataIndex: 'txStart', align: 'right'},
                {header: 'txEnd', sortable: true, filterable: true, width: 85, dataIndex: 'txEnd', align: 'right'},
                {header: 'strand', sortable: true, filterable: true, width: 40, dataIndex: 'strand', align: 'center'},
                {header: 'region', sortable: true, filterable: true, width: 85, dataIndex: 'region'},

                {header: 'chrom', sortable: true, filterable: true, width: 60, dataIndex: 'chrom'},
                {header: 'start', sortable: true, filterable: true, width: 80, dataIndex: 'start', align: 'right'},
                {header: 'end', sortable: true, filterable: true, width: 85, dataIndex: 'end', align: 'right'},
                {
                    header: 'length',
                    sortable: true,
                    filterable: true,
                    width: 85,
                    dataIndex: 'length',
                    align: 'right',
                    hidden: true
                },
                {
                    header: 'pileup',
                    sortable: true,
                    filterable: true,
                    width: 85,
                    dataIndex: 'pileup',
                    align: 'right',
                    hidden: true
                },
                {
                    header: 'abssummit',
                    sortable: true,
                    filterable: true,
                    width: 85,
                    dataIndex: 'abssummit',
                    align: 'right'
                },
                {header: 'log10p', sortable: true, filterable: true, width: 85, dataIndex: 'log10p', align: 'right'},
                {
                    header: 'foldenrich',
                    sortable: true,
                    filterable: true,
                    width: 85,
                    dataIndex: 'foldenrich',
                    align: 'right'
                },
                {header: 'log10q', sortable: true, filterable: true, width: 85, dataIndex: 'log10q', align: 'right'}
            ],
            bbar: [
                {
                    xtype: 'pagingtoolbar',
                    store: 'Islands',
                    margin: '0 5 0 5',
                    displayInfo: true
                },
                {
                    xtype: 'checkboxfield',
                    labelAlign: 'left',
                    boxLabelAlign: 'before',
                    inputValue: true,
                    fieldLabel: 'Show uniq islands?',
                    margin: '0 10 0 5',
                    //margin: '21 0 0 8',
                }
            ],
            tbar: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    margin: 0,

                    items: [
                        {
                            xtype: 'numberfield',
                            itemId: 'promoter',
                            value: 1000,
                            minValue: 0,
                            labelWidth: '',
                            labelAlign: 'left',
                            labelStyle: 'white-space: nowrap;',
                            maxWidth: 150,
                            boxLabelAlign: 'before',
                            fieldLabel: 'Promoter Size',
                            margin: '0 10 0 5',
                            listeners: {
                                afterrender: function(c){
                                    var tip = Ext.create('Ext.tip.ToolTip', {
                                        target: c.id,
                                        dismissDelay: 10000,
                                        html: '<div style="text-align: left; font-size: 110%; font-weight: bold; color:#04408C;">' +
                                              'Promoter size - the number of BP up to and down from TSS. <br> ' +
                                              'Press apply.</div>'
                                    });
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'apply',
                            itemId: 'promoterapply',
                            width: 70,
                            submitValue: false,
                            iconCls: 'document-ok',
                            iconAlign: 'left',
                            margin: '0 10 0 5'
                        },
                        {
                            xtype: 'button',
                            text: 'jump',
                            itemId: 'browser-jump-islands',
                            width: 70,
                            submitValue: false,
                            iconCls: 'genome-browser',
                            iconAlign: 'left',
                            margin: '0 10 0 5'
                        }
                    ]
                },
                '->',
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',

                    items: [
                        {
                            xtype: 'button',
                            text: 'retain filter',
                            itemId: 'retain',
                            width: 100,
                            submitValue: false,
                            iconCls: 'funnel-add',
                            iconAlign: 'left',
                            margin: '0 10 0 5'
                        },{
                            xtype: 'numberfield',
                            itemId: 'fasta',
                            value: 50,
                            minValue: 0,
                            labelWidth: '',
                            labelStyle: 'white-space: nowrap;',
                            labelAlign: 'left',
                            maxWidth: 130,
                            boxLabelAlign: 'before',
                            fieldLabel: 'Fasta region',
                            margin: '0 10 0 15',
                            listeners: {
                                afterrender: function(c){
                                    var tip = Ext.create('Ext.tip.ToolTip', {
                                        target: c.id,
                                        dismissDelay: 10000,
                                        html: '<div style="text-align: left; font-size: 110%; font-weight: bold; color:#04408C;">' +
                                              'Filter data in the table and save it with "retain" button. <br> ' +
                                              'Decide the region around summit and put it here, if the number is 0 whole island will be used.<br>' +
                                              'Press "get fasta".</div>'
                                    });
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'get fasta',
                            itemId: 'getfasta',
                            width: 70,
                            submitValue: false,
                            iconCls: 'disk',
                            iconAlign: 'left',
                            margin: '0 5 0 5'
                        },
                        {
                            xtype: 'button',
                            store: 'Islands',
                            text: 'save',
                            href: '',
                            itemId: 'islands-save',
                            width: 70,
                            submitValue: false,
                            iconCls: 'disk',
                            margin: '0 10 0 15'
                        }
                    ]
                }
            ]//tbar
        }
    ]//me.items

})
;


