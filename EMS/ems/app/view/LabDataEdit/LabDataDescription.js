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

//Ext.require('Ext.chart.*');

Ext.define('EMS.view.LabDataEdit.LabDataDescription', {
               extend: 'Ext.Panel',

               bodyPadding: 5,
               border: false,
               frame: false,
               layout: 'border',
               plain: true,
               initComponent: function() {
                   var me=this;

                   me.items= [
                               {
                                   xtype: 'panel',
                                   frame: false,
                                   border: true,
                                   height: 250,
                                   layout: 'fit',
                                   region: 'north',
                                   id: 'experiment-description',
                                   tpl: Ext.create('Ext.XTemplate',
                                                   '<table class="experiment-descr">',
                                                   '<tr><td class="experiment-descr-1">Experiment date:</td><td colspan=2 class="experiment-descr-2">{dateadd:date("m/d/Y")}</td></tr>',
                                                   '<tr><td class="experiment-descr-1">Cells type:</td><td colspan=2 class="experiment-descr-2">{cells}</td></tr>',
                                                   '<tr><td class="experiment-descr-1">Conditions:</td><td colspan=2 class="experiment-descr-2">{conditions}</td></tr>',
                                                   '<tr><td class="experiment-descr-1">Tags total:</td><td class="experiment-descr-2">{[this.numformat(values.tagstotal)]}</td>',
                                                   '<td rowspan={[this.rowspan(values.tagsribo)]} class="experiment-descr-3" id="exp-chart"></td></tr>',
                                                   '<tr><td class="experiment-descr-1">Tags mapped:</td><td class="experiment-descr-2">{[this.numformat(values.tagsmapped)]}</td></tr>',
                                                   '<tr><td class="experiment-descr-1">Tags mapped percent:</td><td class="experiment-descr-2">{tagspercent}</td></tr>',
                                                   '<tpl if="isRNA">',
                                                   '<tr><td class="experiment-descr-1">Ribosomal reads:</td><td class="experiment-descr-2">{[this.numformat(values.tagsribo)]}</td></tr>',
                                                   '<tr><td class="experiment-descr-1">Ribosomal reads percent:</td><td class="experiment-descr-2">{tagsribopercent}</td></tr>',
                                                   '<tpl else>',
                                                   '<tr><td class="experiment-descr-1">Suppressed reads:</td><td class="experiment-descr-2">{[this.numformat(values.tagsribo)]}</td></tr>',
                                                   '<tr><td class="experiment-descr-1">Suppressed reads percent:</td><td class="experiment-descr-2">{tagsribopercent}</td></tr>',
                                                   '<tr><td class="experiment-descr-1">Estimated fragment size:</td><td class="experiment-descr-2">{fragmentsize}</td></tr>',
                                                   '</tpl>',
                                                   '<tr><td class="experiment-descr-1">File link:</td>',
                                                   '<td colspan=2 class="experiment-descr-2">',
                                                   '{[this.filename(values.filename,values.RNADNA,values.worker)]}</td>',
                                                   '</table>', {
                                                       rowspan: function(values) {
                                                           if(values>0)
                                                               return 5;
                                                           return 3;
                                                       },
                                                       filename: function(str,rnadna,worker) {
                                                           var basename=str.split(';')[0];
                                                           return '<a href="https://10.1.97.82/FASTQ-DATA/'+worker+'/'+rnadna+'/'+basename+'.bam">'+basename+".bam</a>";
                                                       },
                                                       numformat: function(num) {
                                                           var c=1;
                                                           var nums=num.toString();
                                                           var idx=nums.length%3;
                                                           var result=nums.slice(0,idx);
                                                           for(var i=idx; i<nums.length; i+=3){
                                                               result +=' '+nums.slice(i,i+3)
                                                           }
                                                           return result;
                                                       }
                                                   }
                                                   )
                               } , {
                                   xtype: 'panel',
                                   frame: false,
                                   border: true,
                                   region: 'center',
                                   collapsible: false,
                                   title: 'Nucleotide frequency in sequences',
                                   layout: 'fit',
                                   items: [ Ext.create('EMS.view.charts.Fence') ]/*,
                                   listeners: {
                                       render: function(p) {
                                           var xxx=new Ext.Resizable(p.getEl(), {
                                                                         target: this,
                                                                         pinned:true,
                                                                         minWidth:50,
                                                                         minHeight: 50,
                                                                         preserveRatio: true
                                                                     });
                                       }
                                   }*/
                               }
                           ];
                   me.callParent(arguments);
               }
           });


