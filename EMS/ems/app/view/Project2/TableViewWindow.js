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


Ext.define('EMS.view.Project2.TableViewWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.TableViewWindow',
    title: 'View table data',
    layout: 'fit',
    iconCls: 'table2',
    buttonAlign: 'center',
    maximizable: true,
    constrain: true,

    plain: true,
    height: 700,
    width: 1000,
    border: false,

    initComponent: function () {

        var me = this;

        me.targetFrame=Ext.create('EMS.view.Project2.TableView',{store: me.initialConfig.store});

        me.items =me.targetFrame;
/*        [
            {
                xtype: 'tabpanel',
                id: 'tableview-main-tab-panel',
                frame: true,
                border: false,
                plain: true,
                activeTab: 0,
                items: [
                    {
                        xtype: 'panel',
                        layout: 'fit',
                        //title: 'Genome browser',
                        //iconCls: 'genome-browser',

                        items: me.targetFrame
                    }


                ]
            }
        ];*/

        me.buttons = [
            {
                text: 'Close',
                handler: function () {
                    me.close();
                }
            }
        ];

        me.callParent(arguments);
    }
});

