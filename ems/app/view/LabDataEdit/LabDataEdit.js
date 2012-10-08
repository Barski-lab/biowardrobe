Ext.require('EMS.store.ExperimentTypes');
Ext.require('EMS.store.Workers');
Ext.require('EMS.store.Genome');
Ext.require('EMS.store.Protocol');
Ext.require('EMS.store.Antibodies');
Ext.require('EMS.store.Crosslinking');
Ext.require('EMS.store.Fragmentation');

Ext.define('EMS.view.LabDataEdit.LabDataEdit', {
    extend: 'Ext.window.Window',
    alias : 'widget.LabDataEdit',

    requires: ['Ext.form.Panel'],
    stores: ['Genome','Protocol','ExperimentTypes'],
    title : 'Laboratory Data Edit',
    layout: 'fit',
    buttonAlign: 'center',
//    autoShow: true,
    plain: true,
    height: 300,
    width: 450,

    initComponent: function() {
        this.items = [
            {
                xtype: 'form',
                padding: '5 5 0 5',
                border: false,
                frame: true,
                fieldDefaults: { labelWidth: 120 },
                items: 
                  [
                     {
                        xtype: 'textfield',
                        anchor: '100%',
//                        flex: 1,
                        name : 'Name4browser',
                        fieldLabel: 'Name for browser'
                     },
                     {
                        xtype: 'textfield',
                        name : 'Cells',
                        fieldLabel: 'Cells',
                        anchor: '100%',
//                        flex: 1
                     },
                     {
                        xtype: 'textfield',
                        name : 'LibCode',
                        fieldLabel: 'Library Code',
                        anchor: '100%',
//                        flex: 1
                     },
                     {
                      layout: { type: 'hbox', pack: 'center', align: 'middle' },
                      height: 50,
                      items:[
                      {
                          xtype: 'combobox',
                          name : 'protocol',
                          store: EMS.store.Protocol,
                          displayField: 'protocol',
                          fieldLabel: 'Protocol',
//                          hideTrigger: true,
                          mode: 'local',
                          typeAhead: false,
                          editable:false,
                          valueField: 'id',
                          triggerAction: 'all',
                          queryMode: 'local',
                          labelWidth: 70,
                          width: 150
                       },
                       {
                          xtype: 'tbspacer', width: 50 
                       },{
                          xtype: 'combobox',
                          name : 'Type',
//                          store: (new EMS.store.ExperimentTypes).load(),
                          store: EMS.store.ExperimentTypes,
                          displayField: 'Type',
                          fieldLabel: 'Experiment Type',
//                          hideTrigger: true,
                          mode: 'local',
                          typeAhead: false,
                          editable:false,
                          valueField: 'id',
                          triggerAction: 'all',
                          queryMode: 'local',
                          labelWidth: 100,
                          width: 200
                       }]
                      },
                      {
                      layout: { type: 'hbox', pack: 'center', align: 'middle' },
                      height: 50,
                      items:[
                        {
                          xtype: 'numberfield',
                          name : 'Spikeins',
                          fieldLabel: 'Spikeins',
                          labelWidth: 70,
                          width: 150
                       },
                       {
                          xtype: 'tbspacer', width: 50 
                       },{
                          xtype: 'combobox',
                          name : 'genomeType',
                          store: EMS.store.Genome,
                          displayField: 'Genome',
                          fieldLabel: 'Genome Type',
                          mode: 'local',
                          typeAhead: false,
                          editable:false,
                          valueField: 'id',
                          triggerAction: 'all',
                          queryMode: 'local',
                          labelWidth: 100,
                          width: 200
                       }
                      ]
                     }
                ]
            }
        ];

        this.buttons = [
            {
                text: 'Save',
                action: 'save'
            },
            {
                text: 'Cancel',
                scope: this,
                handler: this.close
            }
        ];

        this.callParent(arguments);
    }
});

