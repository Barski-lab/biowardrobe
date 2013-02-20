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


var Rights = (function(){
    var store;
    var worker;
    return {
        check: function(user,place){
            if( typeof worker === 'undefined')
                worker=store.findRecord('id',USER_ID).data.worker;
            if(worker === 'porter')
                return 1;
            return 0;
        },
        init: function(s){
            s.load();
            store=s;
        }
    };
})();

var Timer = (function(){
    var time;
    var task;
    var runner;
    return {
        get: function(){
            var cur_date=new Date();
            if(typeof time === 'undefined')
                this.set();
            if(cur_date- time >= 550000) {
                window.location="login.php?timeout=true";
            }
        },
        set: function(){
            time=new Date();
        },
        init: function(){
            if(typeof runner !== 'undefined') return;
            this.set();
            task = {
                run: this.get,
                interval: 60000 //once per min
            }
            runner = new Ext.util.TaskRunner();
            runner.start(task);
        }
    };
})();



Ext.application({
                    name: 'EMS',

                    appFolder: 'app',
                    controllers: [
                        'EMS.controller.EMSMenu',
                        'EMS.controller.ExperimentTypeEdit',
                        'EMS.controller.ExperimentsWindow',
                        'EMS.controller.WorkersEdit',
                        'EMS.controller.GenomeEdit',
                        'EMS.controller.AntibodiesEdit',
                        'EMS.controller.CrosslinkEdit',
                        'EMS.controller.FragmentationEdit',
                        'EMS.controller.Spikeins',
                        'EMS.controller.SequenceCutter',
                    ],

                    views: [
                        'EMSMenu'
                    ],



                    launch: function() {

                        Ext.create('Ext.container.Viewport', {

                                       layout: 'border',

                                       items:
                                           [
                                           {
                                               region: 'north',
                                               title: '<div style="float: left; text-align: left;">Allergy department experiments management software</div><div style="float: right; text-align: right;">Wellcome: '+USER_NAME+
                                                      "<a href=login.php>&nbsp;logout</a></div>",
                                               autoHeight: true
                                           } , {
                                               region: 'south',
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
                                           } , {
                                               xtype: 'EMSMenu',
                                               id: 'EMSMenu',
                                               region: 'center',
                                               border: false,
                                               layout: 'fit'
                                           }
                                       ]//items Viewport

                                   });//ext create
                        Rights.init(Ext.getStore('Worker'));
                        Timer.init();
                    }//launch func

                });//application

