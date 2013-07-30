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

Ext.define('EMS.view.Project2.Filter', {
               extend: 'Ext.window.Window',
               requires: ['Ext.form.Panel'],
               title : 'Filter settings',
               id: 'Project2Filter',
               layout: 'fit',
               iconCls: 'funnel-add',
               maximizable: false,
               collapsible: false,
               constrain: true,
               minHeight: 350,
               minWidth: 300,
               height: 400,
               width: 700,
               initComponent: function() {
                   var me = this;
                   me.groups=[];
                   me.filterc=0;
                   me.filters = Ext.create('Ext.data.Store', {
                                               fields: ['id', 'name'],
                                               data : [
                                                   {"id":1, "name":"equal"},
                                                   {"id":2, "name":"not equal"},
                                                   {"id":3, "name":"less than"},
                                                   {"id":4, "name":"less than or equal"},
                                                   {"id":5, "name":"greater than"},
                                                   {"id":6, "name":"greater than or equal"}
                                               ]
                                           });
                   var fieldsdata=[
                               {"id":1, "name":"RPKM"},
                               {"id":2, "name":"Chromosome"}];

                   if(false) {
                       fieldsdata=fieldsdata.concat([{"id":3, "name":"Log Ratio"},
                                                     {"id":4, "name":"P-value"},
                                                     {"id":5, "name":"P-adjasted"}]);
                   }
                   me.fields =  Ext.create('Ext.data.Store', {
                                               fields: ['id', 'name'],
                                               data : fieldsdata
                                           });

                   me.operand =  Ext.create('Ext.data.Store', {
                                                fields: ['id', 'name'],
                                                data : [
                                                    {"id":1, "name":"AND"},
                                                    {"id":2, "name":"OR"}
                                                ]
                                            });
                   var tablesN=[];
                   var i=0;
                   for(i=0;i<me.initialConfig.tables.getChildAt(0).childNodes.length; i++) {
                       tablesN.push({
                                        id: me.initialConfig.tables.getChildAt(0).childNodes[i].data.id,
                                        name: me.initialConfig.tables.getChildAt(0).childNodes[i].data.name
                                    });
                   }
                   for(i=0;i<me.initialConfig.tables.getChildAt(1).childNodes.length; i++) {
                       tablesN.push({
                                        id: me.initialConfig.tables.getChildAt(1).childNodes[i].data.id,
                                        name: me.initialConfig.tables.getChildAt(1).childNodes[i].data.name
                                    });
                   }
                   me.tables =  Ext.create('Ext.data.Store', {
                                               fields: [ 'id','name'],
                                               data : tablesN
                                           });

                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: { pack: 'center' },
                                        items: [{
                                                xtype: 'button',
                                                minWidth: 90,
                                                text: 'Set',
                                                handler: function() {
                                                    var form = Ext.getCmp('ProjectFilterForm');

                                                    if(form.getForm().isValid()) {
                                                        var formData = me.getFormJson();
                                                        LocalStorage.createData(1,Ext.encode(formData));

                                                        if(typeof me.initialConfig.onSubmit !== 'undefined') {
                                                            me.initialConfig.onSubmit();
                                                        }
                                                    }
                                                }
                                            }]
                                    }];

                   me.items=[{
                                 xtype: 'form',
                                 id: 'ProjectFilterForm',
                                 border: false,
                                 frame: false,
                                 plain: true,
                                 autoScroll: true,
                                 items: [
                                     {
                                         xtype: 'container',
                                         padding: 0,
                                         layout: {
                                             type: 'hbox',
                                             align: 'stretch'
                                         },
                                         items: [
                                             {
                                                 xtype: 'textfield',
                                                 margin: '0 5 0 5',
                                                 id: 'filter-name',
                                                 fieldLabel: 'Filter name, will be saved with this name',
                                                 afterLabelTextTpl: required,
                                                 submitValue: true,
                                                 allowBlank: false,
                                                 labelAlign: 'top',
                                                 maxLength: 50,
                                                 maxLengthText: 'Maximum length of this field is 50 chars',
                                                 enforceMaxLength: true,
                                                 flex: 2,
                                                 minWidth: 200,
                                                 anchor: "100%",
                                                 labelWidth: 300,
                                                 enableKeyEvents: true
                                             },{
                                                 xtype: 'combobox',
                                                 displayField: 'name',
                                                 valueField: 'id',
                                                 editable: false,
                                                 value: LocalStorage.getParam(2,'default_annotation_groupping'),
                                                 id: 'filter-rna-type',
                                                 fieldLabel: 'Annotation groupping',
                                                 labelAlign: 'top',
                                                 labelWidth: 300,
                                                 margin: '0 5 0 5',
                                                 allowBlank: false,
                                                 listeners: {
                                                     'select': function(combo, records) {
                                                         LocalStorage.setParam(2,'default_annotation_groupping',combo.getValue())
                                                     }
                                                 },
                                                 store: Ext.create('Ext.data.Store', {
                                                                       fields: ['id', 'name'],
                                                                       data : [
                                                                           {"id": 1, "name":"RPKM isoforms"},
                                                                           {"id": 2, "name":"RPKM genes"},
                                                                           {"id": 3, "name":"RPKM common tss"}
                                                                       ]
                                                                   }),
                                                 flex: 1 }]
                                     }]
                             }];


                   this.on('afterrender',function() {
                       var data=LocalStorage.findData(1);
                       if(data) {
                           me.setFormJson(data);
                       } else {
                           Ext.getCmp('ProjectFilterForm').add(me.addFilter());
                       }
                   },{single: true});
                   me.callParent(arguments);
               },

               /******************************************************************
                ******************************************************************/
               checkVal: function (obj,param,def) {
                   if(typeof obj !== 'undefined' && typeof obj[param] !== 'undefined') {
                       return obj[param];
                   }

                   return def;
               },

               /******************************************************************
                ******************************************************************/
               firstOpReadOnly: function(filterc) {
                   var combo=Ext.getCmp('filter_fieldset_'+filterc).getComponent(0).getComponent(0);
                   combo.setValue(1);
                   combo.setReadOnly(true);
                   var bt=Ext.getCmp('filter_fieldset_'+filterc).getComponent(0).getComponent(7);
                   bt.setDisabled(true);
               },

               /******************************************************************
                ******************************************************************/
               chrSelected: function(val,filterc,subfilter) {
                   var form=Ext.getCmp('ProjectFilterForm').getForm();
                   var cond = form.findField(filterc+'_'+subfilter+'_condition');
                   var t_v = form.findField(filterc+'_'+subfilter+'_t_value');
                   var n_v = form.findField(filterc+'_'+subfilter+'_n_value');
                   if(val===2) {
                       cond.setValue(1);
                       cond.setReadOnly(true);
                       t_v.setVisible(true);
                       t_v.setDisabled(false);
                       n_v.setVisible(false);
                       n_v.setDisabled(true);
                   } else {
                       cond.setReadOnly(false);
                       t_v.setVisible(false);
                       t_v.setDisabled(true);
                       n_v.setVisible(true);
                       n_v.setDisabled(false);
                   }
               },

               /******************************************************************
                ******************************************************************/
               addFilter: function(name,params) {
                   var me=this;
                   if(me.filterc>0) return;
                   //console.log('adding');
                   var filter= Ext.create('Ext.form.FieldSet',{
                                              xtype: 'fieldset',
                                              title: 'Filter ',
                                              margin: '5 5 5 5',
                                              subfilter: 1,
                                              subfilterc: 0,
                                              filterc: me.filterc,
                                              flex: 2,
                                              id: 'filter_fieldset_'+me.filterc,
                                              layout: { type: 'fit' },
                                          });
                   me.addSubFilter(me.filterc,filter,params);
                   me.firstOpReadOnly(me.filterc);
                   me.filterc++;

                   return filter;
               },

               /******************************************************************
                ******************************************************************/
               addSubFilter: function(filterc,pf,params) {
                   var me=this;
                   var subfilter=pf.subfilter;
                   pf.subfilter++;
                   pf.subfilterc++;
                   var subf={
                       xtype: 'fieldcontainer',
                       id: 'filter_container_'+filterc+'_'+subfilter,
                       subfilter: subfilter,
                       padding: 4,
                       layout: {
                           type: 'hbox',
                           align: 'stretch'
                       },
                       items: [{
                               xtype: 'combobox',
                               name : filterc+'_'+subfilter+'_operand',
                               displayField: 'name',
                               valueField: 'id',
                               value: parseInt(me.checkVal(params,'operand',1)),
                               store: me.operand,
                               flex: 1,
                               width: 65,
                               editable: false,
                               margin: 0
                           } , {
                               xtype: 'combobox',
                               name : filterc+'_'+subfilter+'_tbl',
                               displayField: 'name',
                               store: me.tables,
                               valueField: 'id',
                               value: me.initialConfig.item_id,
                               minWidth: 120,
                               flex: 3,
                               editable: false,
                               margin: '0 0 0 6'
                           } , {
                               xtype: 'combobox',
                               name : filterc+'_'+subfilter+'_field',
                               displayField: 'name',
                               valueField: 'id',
                               value: parseInt(me.checkVal(params,'field',1)),
                               store: me.fields,
                               flex: 2,
                               editable: false,
                               margin: '0 0 0 6',
                               listeners: {
                                   'select': function(sender, values) {
                                       me.chrSelected(values[0].data.id,filterc,subfilter);
                                   },
                                   'render': function(sender) {
                                       me.chrSelected(sender.getValue(),filterc,subfilter);
                                   }
                               }

                           } , {
                               xtype: 'combobox',
                               name : filterc+'_'+subfilter+'_condition',
                               displayField: 'name',
                               valueField: 'id',
                               value: parseInt(me.checkVal(params,'condition',1)),
                               store: me.filters,
                               flex: 2,
                               editable: false,
                               margin: '0 0 0 6',

                           } , {
                               xtype: 'textfield',
                               name: filterc+'_'+subfilter+'_t_value',
                               flex: 1,
                               margins: '0 5 0 6',
                               width: 70,
                               hidden: true,
                               value: me.checkVal(params,'value',''),
                               allowBlank: false,
                               disabled: true
                           } , {
                               xtype: 'numberfield',
                               name: filterc+'_'+subfilter+'_n_value',
                               flex: 1,
                               margins: '0 5 0 6',
                               width: 70,
                               value: me.checkVal(params,'value',0.0),
                               step: 0.1,
                               allowBlank: false
                           } , {
                               xtype: 'button',
                               margin: '0 5 0 5',
                               submitValue: false,
                               iconCls: 'add',
                               handler: function() {
                                   pf.add(me.addSubFilter(filterc,pf));
                               }
                           } , {
                               xtype: 'button',
                               margin: '0 5 0 5',
                               submitValue: false,
                               iconCls: 'delete',
                               handler: function() {
                                   pf.subfilterc--;
                                   if(pf.subfilterc===0) {
                                       pf.subfilterc=1;
                                   } else {
                                       pf.remove('filter_container_'+filterc+'_'+subfilter,true);
                                       me.firstOpReadOnly(filterc);
                                   }
                               }
                           }]
                   };
                   pf.add(subf);
               },

               /******************************************************************
                ******************************************************************/
               setFormJson: function(data) {
                   var me=this,
                           form = Ext.getCmp('ProjectFilterForm'),i=0;
                   var filter;
                   Ext.getCmp('filter-name').setValue(data[i].name);
                   for(var j=0;j<data[i].conditions.length;j++) {
                       if(j==0) {
                           filter=me.addFilter(data[i].name,data[i].conditions[j]);
                           form.add(filter);
                       } else {
                           me.addSubFilter(filter.filterc,filter,data[i].conditions[j]);
                       }
                   }
                   form.getForm().clearInvalid();
               },

               /******************************************************************
                ******************************************************************/
               getFormJson: function() {
                   var form = Ext.getCmp('filter_fieldset_0');
                   var formData = [];
                   var i={
                       name: Ext.getCmp('filter-name').getValue(),
                       annottype: Ext.getCmp('filter-rna-type').getValue(),
                       conditions: [] };
                   form.items.each(function(si) {
                       if(si.getXType() === 'fieldcontainer') {
                           var struct={
                               operand: si.getComponent(0).getValue(),
                               table: si.getComponent(1).getValue(),
                               field: si.getComponent(2).getValue(),
                               condition: si.getComponent(3).getValue(),
                               value: si.getComponent(5).getValue(),
                           };
                           if(struct.field === 2) {
                               struct.value=si.getComponent(4).getValue();
                           }
                           i.conditions.push(struct);
                       }
                   });
                   formData.push(i);
                   return formData;
               }

           });
