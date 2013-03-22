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

Ext.define('EMS.view.ProgressBar', {
               extend: 'Ext.Window',
               //alias : 'widget.ProgressBar',
               width: 500,
               minWidth: 300,
               height: 80,
               //title: 'Progress',
               closable: false,
               maximizable: false,
               constrain: true,
               draggable: false,
               resizable: false,
               //iconCls: '',
               layout: 'fit',
               initComponent: function() {
                   var me = this;
                   me.progress = Ext.create('Ext.ProgressBar', {
                      width: 400
                   });

                   // Wait for 5 seconds, then update the status el (progress bar will auto-reset)
                   me.progress.wait({
                       interval: 15000, //bar will move fast!
                       duration: 600000,
                       increment: 10,
                       text: 'Processing...',
                       scope: this,
                       fn: function(){
                           me.progress.updateText('Done!');
                       }
                   });
                   me.items =[me.progress];
                   this.callParent(arguments);
               }

           });
