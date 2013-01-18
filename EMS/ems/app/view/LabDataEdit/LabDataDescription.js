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
               extend: 'Ext.form.Panel',

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
                                   height: 150,
                                   layout: 'fit',
                                   region: 'north',
                                   id: 'experiment-description',
                                   tpl: Ext.create('Ext.XTemplate',
                                                   '<b>Experiment date:</b> {dateadd}<br>',
                                                   '<b>Cells type:</b> {cells}<br>',
                                                   '<b>Conditions:</b> {conditions}<br>',
                                                   '<b>Tags mapped:</b> {tagsmapped}<br>',
                                                   '<b>Tags total:</b> {tagstotal}<br>'
                                                   //'<b>Ribosomal contamination:</b> {ribosomal}<br>'
                                                   )
                               } , {
                                   xtype: 'panel',
                                   frame: false,
                                   border: true,
                                   region: 'center',
                                   collapsible: false,
                                   title: 'Nucleotide frequency in sequence',
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


