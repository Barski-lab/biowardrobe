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

Ext.define('EMS.view.Info.Supplemental',
           {
               extend: 'Ext.window.Window',
               alias: 'widget.infosupplemental',
               requires: ['Ext.form.Panel',
                          'EMS.util.Util'],
               title: 'Supplemental Materials',
               layout: 'fit',
               iconCls: 'notebook-edit',
               maximizable: true,
               closeAction: 'destroy',
               minHeight: 550,
               minWidth: 700,
               height: 550,
               width: 900,

               dockedItems: [
                   {
                       xtype: 'toolbar',
                       dock: 'bottom',
                       ui: 'footer',
                       layout: {
                           pack: 'center'
                       },
                       items: [
                           {
                               minWidth: 90,
                               text: 'Save',
                               itemId: 'save-supplemental-info'
                           },
                           {
                               minWidth: 90,
                               text: 'Close',
                               handler: function (but) {
                                   but.up('window').close();
                               }
                           }
                       ]
                   }
               ],
               items: [
                   {
                       xtype: 'form',
                       layout: 'fit',
                       frame: false,
                       border: false,
                       items: []
                   }
               ]
           });
