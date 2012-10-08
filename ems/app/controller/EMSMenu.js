
var ExperimentsWindow,WorkersEditWindow,FenceChartWindow;

//Ext.require('EMS.view.ExperimentsWindow');

Ext.define('EMS.controller.EMSMenu', {
    extend: 'Ext.app.Controller',

    views:['EMSMenu'],
//,'ExperimentsWindow.Main'
    init: function() 
      {
        console.log('Initialized!');
        this.control({
/*         'viewport > EMSMenu': {
             render: this.onPanelRendered
         },*/
         'EMSMenu button > menuitem': {
             click: this.onEMSMenuForms
         }
        });
      },

//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
    onPanelRendered: function() {
        console.log('The panel was rendered');
            },

//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------
    onEMSMenuForms: function(menuitem,e,opt) {
       
       console.log('Menuitem \''+menuitem.action+'\' choosed.');

       if(menuitem.action=="LabData"){
        if(!ExperimentsWindow){
          ExperimentsWindow=Ext.create('EMS.view.ExperimentsWindow.Main',{});
          Ext.getCmp('EMSMenu').add(ExperimentsWindow);
        }
        if(ExperimentsWindow.isVisible()){
          ExperimentsWindow.hide(); }
        else {
          ExperimentsWindow.show(); }
       }

       if(menuitem.action=="Workers"){
        if(!WorkersEditWindow){
          WorkersEditWindow=Ext.create('EMS.view.WorkersEdit',{});
          Ext.getCmp('EMSMenu').add(ExperimentsWindow);
        }
        if(WorkersEditWindow.isVisible()){
          WorkersEditWindow.hide(); }
        else {
          WorkersEditWindow.show(); }
       }

       if(menuitem.action=="AdaptorCont"){
        if(!FenceChartWindow){
          FenceChartWindow=Ext.create('EMS.view.charts.Fence',{});
          Ext.getCmp('EMSMenu').add(FenceChartWindow);
        }
        if(FenceChartWindow.isVisible()){
          FenceChartWindow.hide(); }
        else {
          FenceChartWindow.show(); }
        
       }
       if(menuitem.action=="ATD"){

Ext.create('Ext.window.Window', {
    width: 400,
    minWidth: 200,
    height: 300,
    title: 'Average Tag Density',
    closable: true,
    maximizable: true,
//    closeAction: 'hide',
    constrain: true,

    layout: 'fit',
    items: [{
                xtype: 'html',
//                itemId: 'imgCt',
                layout: 'fit',
                src: 'http://localhost/TE7_IL13_2hr_6hr.svg'
//                margin: '0 20 0 0',
//                width : 250,
//                height: 308
    }]
}).show();



       }
    }
//-----------------------------------------------------------------------
//
//
//-----------------------------------------------------------------------

});
