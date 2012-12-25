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

Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath(
            {'EMS': 'app'},
            {'Ext.ux': 'ux/'}
            );


var Logger = (function(){
    var panel;
    var queue;

    return {
        log: function(msg, color){
            color = typeof color !== 'undefined' ? color : "blue";
            if(typeof panel !== 'undefined')
            {
                panel.update({
                                 now: new Date(),
                                 cls: color,
                                 msg: msg
                             });
                panel.body.scroll('b', 100000, true);
                console.log(msg);
            }
            else
            {
                console.log(msg);
            }
        },
        init: function(logv){
            panel = logv;
            panel.update({
                             now: new Date(),
                             cls: 'blue',
                             msg: 'Logging is on'
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
                            'EMS.view.ExperimentsWindow.ExperimentsWindow'
                        ],*/
                    controllers: [
                        'EMS.controller.EMSMenu',
                        'EMS.controller.ExperimentsWindow',
                        'EMS.controller.WorkersEdit',
                        'EMS.controller.GenomeEdit',
                        'EMS.controller.AntibodiesEdit',
                        'EMS.controller.ProtocolEdit',
                        'EMS.controller.ExperimentTypeEdit',
                        'EMS.controller.CrosslinkEdit',
                        'EMS.controller.FragmentationEdit'
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
                                               title: '<div style="float: left; text-align: left;">Allergy department experiments management software (dr. Barski laboratory)</div><div style="float: right; text-align: right;">Wellcome: '+USER_NAME+
                                                      "<a href=login.php>&nbsp;logout</a></div>",
                                               autoHeight: true
                                           },

                                           { region: 'south',
                                               title: '',
                                               collapsible: true,
                                               collapsed: true,
                                               height: 100,
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

