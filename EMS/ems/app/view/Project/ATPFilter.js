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
                   me.filters = Ext.create('Ext.data.Store', {
                                               fields: ['id', 'name'],
                                               data : [
                                                   {"id":1, "name":"equal"},
                                                   {"id":2, "name":"less than"},
                                                   {"id":3, "name":"greater than"}
                                               ]
                                           });
                   me.fields = Ext.create('Ext.data.Store', {
                                              fields: ['id', 'name'],
                                              data : [
                                                  {"id":1, "name":"RPKM"}
                                              ]
                                          });

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
                                                    if(form.getForm().isValid()) {
                                                        form.submit({
                                                                        waitMsg: 'Setting filter',
                                                                        success: function(fp, o) {
                                                                            me.close();
                                                                        }
                                                                    });
                                                    }
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
                                                 xtype: 'hidden',
                                                 name: 'analysis_id',
                                                 value: me.initialConfig.analysis_id,
                                             } , {
                                                 xtype: 'hidden',
                                                 name: 'ahead_id',
                                                 value: me.initialConfig.ahead_id,
                                             } , {
                                                 xtype: 'textfield',
                                                 margin: '0 5 0 5',
                                                 id: 'filter-name',
                                                 fieldLabel: 'Filter name will appear on a plot',
                                                 afterLabelTextTpl: required,
                                                 submitValue: false,
                                                 labelAlign: 'top',
                                                 maxLength: 50,
                                                 maxLengthText: 'Maximum length of this field is 50 chars',
                                                 enforceMaxLength: true,
                                                 flex: 1,
                                                 labelWidth: 120,
                                                 enableKeyEvents: true,
                                                 listeners: {
                                                     specialkey: function (field, event) {
                                                         if (event.getKey() === event.ENTER) {
                                                             var button=Ext.getCmp('filter-add');
                                                             button.handler();
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
                                                     var name=Ext.getCmp('filter-name');
                                                     form.add(me.addFilter(name.getValue()));
                                                     name.setValue('');

                                                 }
                                             } ]
                                     }]
                             }];
                   me.callParent(arguments);
               },
               addFilter: function(name,params) {
                   var me=this;
                   var filter= {
                       xtype: 'fieldset',
                       title: 'Filter: '+name,
                       margin: '5 5 5 5',
                       padding: '5',
                       defaults: { labelWidth: 120, labelAlign: 'top' },
                       layout: 'hbox',
                       items: [ {
                               xtype: 'textfield',
                               name: name+'_name',
                               flex: 3,
                               value: name,
                               allowBlank: false,
                               readOnly: true
                           } , {
                               xtype: 'combobox',
                               name : name+'_field',
                               displayField: 'name',
                               valueField: 'id',
                               value: 1,
                               store: me.fields,
                               flex: 3,
                               editable: false,
                               margin: '0 0 0 6',

                           } , {
                               xtype: 'combobox',
                               name : name+'_condition',
                               displayField: 'name',
                               valueField: 'id',
                               value: 1,
                               store: me.filters,
                               flex: 3,
                               editable: false,
                               margin: '0 0 0 6',

                           } , {
                               xtype: 'numberfield',
                               name: name+'_value',
                               flex: 3,
                               margins: '0 0 0 6',
                               value: 0.0,
                               step: 0.1,
                               allowBlank: false
                           }]
                   };

                   if(typeof params === 'undefined')
                       return filter;

                   return {};
               }
           });
