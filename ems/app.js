
Ext.Loader.setConfig({enabled: true});

//Ext.Loader.setPath('EMS', 'app');

//Ext.require('EMS.model.LabData');
//Ext.require('EMS.store.LabData');

//Ext.require('EMS.view.EMSMenu');
//Ext.require('EMS.view.ExperimentsWindow');


Logger = (function(){
    var panel;
    
    return {
        init: function(log){
            panel = log;
            panel.update({
                now: new Date(),
                cls: 'beforeload',
                msg: 'Logging is on'
            });
            
        },
        
        log: function(msg, isStart){
            panel.update({
                now: new Date(),
                cls: isStart ? 'beforeload' : 'afterload',
                msg: msg
            });
            panel.body.scroll('b', 100000, true);
        }    
    };
})();


Ext.application({
    name: 'EMS',

    appFolder: 'app',
/*    requires: [
        'EMS.view.EMSMenu'
//        'EMS.view.ExperimentsWindow.ExperimentsWindow'
    ],*/
//EMS.controller.
    controllers: [
        'EMS.controller.EMSMenu',
        'EMS.controller.ExperimentsWindow',
        'EMS.controller.WorkersEdit'
    ],


    views: [
        'EMSMenu'
//        'EMS.view.ExperimentsWindow.Main',
//        'EMS.view.ExperimentsWindow.Grid'
    ],



    launch: function() {

      Ext.create('Ext.container.Viewport', {

        layout: 'border',

        items: 
        [
         { region: 'north',
           title: 'Allergy department experements management software (dr. Barski laboratory)',
           autoHeight: true
         },

         { region: 'south',
           title: '',
           collapsible: true,
           collapsed: true,
           height: 60,
           minHeight: 60,
           overflowY : 'scroll',
           tplWriteMode: 'append',
           tpl: '<div class="{cls}">[{now:date("H:i:s")}] - {msg}</div>',
           bodyPadding: 5,
           listeners: {
                render: Logger.init
            }
         },
         { xtype: 'EMSMenu',
           id: 'EMSMenu',
           region: 'center',
           border: false,
           layout: 'fit'
         }

        ]//items Viewport

        });//ext create
    }//lunc func

});//application

