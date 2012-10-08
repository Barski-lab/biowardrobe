
Ext.Loader.setConfig({enabled: true});

//Ext.Loader.setPath('EMS', 'app');

//Ext.require('EMS.model.LabData');
//Ext.require('EMS.store.LabData');

//Ext.require('EMS.view.EMSMenu');
//Ext.require('EMS.view.ExperimentsWindow');

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
           title: 'Experiments management software',
           autoHeight: true
         },

         { region: 'south',
           title: '',
           collapsible: true,
           html: '&nbsp; Logging is on',
           split: true,
           height: 100,
           minHeight: 100
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

