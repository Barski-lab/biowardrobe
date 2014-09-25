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

    //Ext.require('Ext.chart.*');

Ext.define('EMS.view.Experiment.Experiment.QualityControl', {
    extend: 'Ext.Panel',
    alias: 'widget.experimentqualitycontrol',

    requires: [
        'EMS.view.charts.Fence',
        'EMS.view.charts.QCboxplot'
    ],
    bodyPadding: 5,
    border: false,
    frame: false,
    layout: 'border',
    title: 'Quality Control',
    plain: true,
    items: [
        {
            xtype: 'panel',
            frame: false,
            border: true,
            height: 320,
            layout: 'fit',
            region: 'north',
            itemId: 'experiment-description',
            tpl: Ext.create('Ext.XTemplate',
                            '<table class="experiment-descr">',
                            '<tr><td class="experiment-descr-1">Experiment date:</td><td colspan=2 class="experiment-descr-2">{dateadd:date("m/d/Y")}</td></tr>',
                            '<tr><td class="experiment-descr-1">Cell type:</td><td colspan=2 class="experiment-descr-2">{cells}</td></tr>',
                            '<tr><td class="experiment-descr-1">Conditions:</td><td colspan=2 class="experiment-descr-2">{conditions}</td></tr>',
                            '<tr><td class="experiment-descr-1">Tags total:</td><td class="experiment-descr-2">{[this.numformat(values.tagstotal)]}</td>',
                            '<td rowspan={[this.rowspan(values.tagsribo)]} class="experiment-descr-3"><div id="experiment-qc-chart"></div></td></tr>',
                            '<tr><td class="experiment-descr-1">Tags mapped:</td><td class="experiment-descr-2">{[this.numformat(values.tagsused)]}</td></tr>',
                            '<tr><td class="experiment-descr-1">Tags mapped %:</td><td class="experiment-descr-2">{tagsuniqpercent}</td></tr>',
                            '<tr><td class="experiment-descr-1">Multi-mapped reads:</td><td class="experiment-descr-2">{[this.numformat(values.tagssuppressed)]}</td></tr>',
                            '<tr><td class="experiment-descr-1">Multi-mapped reads %:</td><td class="experiment-descr-2">{tagsspercent}</td></tr>',
                            '<tpl if="isRNA">',
                            '<tr><td class="experiment-descr-1">Outside annotation:</td><td class="experiment-descr-2">{[this.numformat(values.tagsex)]}</td></tr>',
                            '<tr><td class="experiment-descr-1">Outside annotation %:</td><td class="experiment-descr-2">{tagsexpercent}</td></tr>',
                            '<tr><td class="experiment-descr-1">Ribosomal contamination:</td><td colspan=2 class="experiment-descr-2">{[this.numformat(values.tagsribo)]}</td></tr>',
                            '<tr><td class="experiment-descr-1">Ribosomal contamination %:</td><td colspan=2 class="experiment-descr-2">{tagsribopercent}</td></tr>',
                            '<tpl else>',
                            '<tr><td class="experiment-descr-1">Mapped duplicates:</td><td class="experiment-descr-2">{[this.numformat(values.tagsex)]}</td></tr>',
                            '<tr><td class="experiment-descr-1">Mapped duplicates %:</td><td class="experiment-descr-2">{tagsexpercent}</td></tr>',
                            '<tr><td class="experiment-descr-1">Estimated fragment size:</td><td colspan=2 class="experiment-descr-2">{fragmentsize}</td></tr>',
                            '</tpl>',
                            '<tr><td class="experiment-descr-1">File link:</td>',
                            '<td colspan=2 class="experiment-descr-2">{[this.filename(values.basename,values.uid)]}</td></tr>',
                            '</table>', {
                        rowspan: function (values) {
                            return 7;
                        },
                        filename: function (basename, uid) {
                            return '<a href="' + basename + '/' + uid + '.bam">' + uid + ".bam</a>";
                        },
                        numformat: function (num) {
                            var c = 1;
                            var nums = num.toString();
                            var idx = nums.length % 3;
                            var result = nums.slice(0, idx);
                            for (var i = idx; i < nums.length; i += 3) {
                                result += ' ' + nums.slice(i, i + 3)
                            }
                            return result;
                        }
                    }
            )
        } ,
        {
            xtype: 'tabpanel',
            itemId: 'experimentqcwindowtabpanel',
            frame: false,
            border: true,
            region: 'center',
            collapsible: false,
            layout: 'fit',
            items: [
                {
                    title: 'Base frequency plot',
                    xtype: 'chartfence'
               },
                {
                    xtype: 'qcboxplot',
                    store: 'Fence',
                    xAxisName: 'Nucleotide position',
                    yAxisName: 'Quality score',
                }
            ]
        }
    ]
});


