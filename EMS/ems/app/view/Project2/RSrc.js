/****************************************************************************
 **
 ** Copyright (C) 2011-2015 Andrey Kartashov .
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

Ext.require(['EMS.ux.aceeditor.Panel']);

Ext.define('EMS.view.Project2.RSrc', {
    extend: 'Ext.window.Window',
    alias: 'widget.AdvancedRSrc',
    frame: false,
    border: false,
    plain: true,
    maximizable: true,
    collapsible: true,
    //constrain: true,
    minHeight: 350,
    minWidth: 300,
    height: 800,
    width: 1100,

    layout: 'fit',
    title: 'Edit R Script',
    iconCls: 'r-logo',

    items: [{
                itemId: 'aceeditor',
                xtype: 'AceEditor',
                title: false,
                theme: 'textmate',
                parser: 'r',
                printMargin: false,
                codeFolding: false,

                tbar: [
                    {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'button',
                                text: 'apply',
                                iconCls: 'document-ok',
                            }]
                    },
                    '-',
                    {
                        xtype: 'combobox',
                        fieldLabel: 'Script to edit',
                        itemId: 'rscript',
                        editable: false,
                        queryMode: 'local',
                        displayField: 'name',
                        labelWidth: 75,
                        minWidth: 230,
                        valueField: 'id',
                        //value: "2",
                        store: 'AdvancedR',
                        margin: "5 5 5 20"
                    }]
            }],

});


