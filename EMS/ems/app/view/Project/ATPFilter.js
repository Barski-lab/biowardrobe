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

Ext.define('EMS.view.Project.ATPFilter', {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel'],
               title : 'Filter settings',
               id: 'ProjectATPFilter',
               layout: 'fit',
               iconCls: 'default',
               maximizable: false,
               collapsible: false,
               constrain: true,
               minHeight: 350,
               minWidth: 300,
               height: 350,
               width: 500,
               initComponent: function() {
                   var me = this;

                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: {
                                            pack: 'center'
                                        },
                                        items: [{
                                                xtype: 'button',
                                                minWidth: 90,
                                                text: 'Set',
                                                handler: function() {
                                                    var form = Ext.getCmp('ProjectATPFilterForm');
                                                    console.log(form);
                                                    if(form.getForm().isValid()){
                                                        console.log('form is valid');
                                                        form.submit();
                                                        //                               form.submit({
                                                        //                                               url: 'data/ATPFilterSet.php',
                                                        ////                                               method: 'POST',
                                                        ////                                               waitMsg: 'Setting filter',
                                                        ////                                               success: function(fp, o) {
                                                        ////                                                   //msg('Success', 'Processed file "' + o.result.file + '" on the server');
                                                        ////                                                   console.log('Success',o);
                                                        ////                                                   console.log('Success',fp);
                                                        ////                                               }
                                                        //                                           });
                                                    }

                                                    me.close();
                                                }
                                            }]
                                    }];

                   me.items=[{
                                 xtype: 'form',
                                 id: 'ProjectATPFilterForm',
                                 border: false,
                                 frame: false,
                                 plain: true,
                                 url: 'data/ATPFilterSet.php',
                                 autoScroll: true,
                                 fieldDefaults: {
                                     labelWidth: 120,
                                     labelAlign: 'top'
                                 },
                                 items: [{
                                         xtype: 'fieldset',
                                         title: 'Add filter',
                                         height: 70,
                                         padding: 0,
                                         margin: '5 5 5 5',
                                         layout: {
                                             type: 'hbox'
                                         },
                                         items: [{
                                                 xtype: 'textfield',
                                                 margin: '0 5 0 5',
                                                 id: 'filter-name',
                                                 fieldLabel: 'Filter name will appear on a plot',
                                                 afterLabelTextTpl: required,
                                                 submitValue: false,
                                                 labelAlign: 'top',
                                                 flex: 1,
                                                 labelWidth: 120,
                                                 enableKeyEvents: true,
                                                 listeners: {
                                                     specialkey: function (field, event) {
                                                         if (event.getKey() === event.ENTER) {
                                                             var button=Ext.getCmp('filter-add');
                                                             button.fireEvent('click',button);
                                                         }
                                                     }
                                                 }

                                             } , {
                                                 xtype: 'button',
                                                 margin: '18 5 0 5',
                                                 width: 100,
                                                 text: 'add',
                                                 id: 'filter-add',
                                                 submitValue: false,
                                                 iconCls: '',
                                                 handler: function() {
                                                     var form = Ext.getCmp('ProjectATPFilterForm');
                                                     form.add(me.addFilter(Ext.getCmp('filter-name').getValue()));
                                                 }
                                             } ]
                                     }]
                             }];

                   //me.items[0].items.push(me.addFilter('Expressed'));
                   me.callParent(arguments);
               },
               addFilter: function(name) {
                   var filters = Ext.create('Ext.data.Store', {
                                                fields: ['id', 'name'],
                                                data : [
                                                    {"id":1, "name":"equal"},
                                                    {"id":2, "name":"less than"},
                                                    {"id":3, "name":"greater than"}
                                                ]
                                            });
                   var fields = Ext.create('Ext.data.Store', {
                                               fields: ['id', 'name'],
                                               data : [
                                                   {"id":1, "name":"RPKM"}
                                               ]
                                           });
                   return {
                       xtype: 'fieldset',
                       title: 'Filter: '+name,
                       margin: '5 5 5 5',
                       padding: '5',
                       defaults: { labelWidth: 120, labelAlign: 'top' },
                       layout: 'hbox',
                       items: [ {
                               xtype: 'textfield',
                               name: name,
                               flex: 3,
                               value: name,
                               allowBlank: false
                           } , {
                               xtype: 'combobox',
                               name : name+'_field',
                               displayField: 'name',
                               valueField: 'id',
                               value: 1,
                               store: fields,
                               flex: 3,
                               editable: false,
                               margin: '0 0 0 6',

                           } , {
                               xtype: 'combobox',
                               name : name+'_condition',
                               displayField: 'name',
                               valueField: 'id',
                               value: 1,
                               store: filters,
                               flex: 3,
                               editable: false,
                               margin: '0 0 0 6',

                           } , {
                               xtype: 'numberfield',
                               name: name+'filter',
                               flex: 3,
                               margins: '0 0 0 6',
                               value: 0.0,
                               step: 0.1,
                               allowBlank: false
                           }]
                   };
               }
           });
