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


Ext.define('EMS.view.Experiment.LabDataEdit.LabDataWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.labdatawindow',

    title: 'Experiment preliminary data',
    layout: 'fit',
    iconCls: 'table2',
    buttonAlign: 'center',
    maximizable: true,
    constrain: true,

    plain: true,
    height: 700,
    width: 900,
    border: false,

    requires: [
        'EMS.view.Experiment.LabDataEdit.LabDataForm',
    ],

    //    initComponent: function () {
    //
    //        var me = this;
    //
    ////        me.labDataForm = Ext.create('EMS.view.Experiment.LabDataEdit.LabDataForm');
    //        me.descriptionDataForm = {};//Ext.create('EMS.view.Experiment.LabDataEdit.LabDataDescription');
    //        me.targetFrame = {};//Ext.create('Ext.ux.IFrame',{ xtype: 'uxiframe', src: 'about:blank' });
    //
    items: [
        {
            xtype: 'tabpanel',
            itemId: 'labdatawindow-main-tab-panel',
            frame: false,
            border: false,
            plain: true,
            activeTab: 0,
            items: [
                {
                    xtype: 'panel',
                    border: false,
                    title: 'Experiment form',
                    layout: 'fit',
                    iconCls: 'form-blue-edit',
                    items: [
                        {
                            xtype: 'labdataform',
                            frame: false,
                            plain: true,
                            border: false
                        }
                    ]
                }
                //                    ,
                //                    {
                //                        xtype: 'panel',
                //                        layout: 'fit',
                //                        title: 'Processed data',
                //                        iconCls: 'chart',
                //                        items: me.descriptionDataForm
                //                    } ,
                //                    {
                //                        xtype: 'panel',
                //                        layout: 'fit',
                //                        title: 'Genome browser',
                //                        iconCls: 'genome-browser',
                //                        items: me.targetFrame
                //                    }


            ]
        }
    ],

    buttons: [
        {
            text: 'Save',
            action: 'save',
            //                id: 'labdata-edit-save'
        } ,
        {
            text: 'Cancel',
            handler: function (button) {
                //                    me.labDataForm.getForm().reset();
                button.up('window').close();
            }
        }
    ]

    //        me.callParent(arguments);
    //    }
});

