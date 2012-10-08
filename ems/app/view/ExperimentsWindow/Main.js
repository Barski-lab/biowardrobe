/*Ext.require('EMS.store.LabData');
Ext.require('EMS.store.ExperimentTypes');
Ext.require('EMS.store.Workers');
Ext.require('EMS.store.Genome');
Ext.require('EMS.store.Antibodies');
Ext.require('EMS.store.Crosslinking');
Ext.require('EMS.store.Fragmentation');
Ext.require('EMS.store.Protocol');
Ext.require('Ext.grid.Panel');
*/


Ext.define( 'EMS.view.ExperimentsWindow.Main' ,{
    extend: 'Ext.Window',
    alias : 'widget.ExperimentsWindow',

//    requires: [ 'EMS.store.LabData' ],

//    controllers: ['EMS.controller.ExperimentsWindow'],
    title: 'Laboratory data',
    closable: true,
    maximizable: true,
    maximized: true,
    closeAction: 'hide',
    constrain: true,
    width: 1200,
    minWidth: 900,
    height: 500,
    iconCls: 'icon-grid',
    layout: 'fit',

    initComponent: function() {
        this.items = [
          Ext.create('EMS.view.ExperimentsWindow.Grid')
        ];
        this.callParent(arguments);
    },//init components function

    tbar: [
      { 
          text:'New',
          tooltip:'Add a new experiment',
          action: 'Add',
          iconCls:'add'
      }, '-'/*, {
                    text:'Options',
                    tooltip:'Blah blah blah blaht',
                    iconCls:'option'
                },'-',{
                    text:'Remove Something',
                    tooltip:'Remove the selected item',
                    iconCls:'remove'}*/
    ]//tbar
});
