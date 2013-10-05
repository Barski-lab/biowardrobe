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


    //Ext.Loader.setPath('EMS','app');
Ext.Loader.setPath('Ext.ux', './ux/');
Ext.Loader.setConfig({enabled: true});
//    {'EMS': 'app'},
//    {'Ext.ux': 'app/ux/'});
//Ext.require([
//    'Ext.ux.IFrame',
//    'Ext.ux.*',
//    'Ext.ux.form.SearchField'
//]);


var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};


var Rights = (function () {
    var store;
    var worker;
    return {
        check: function (user, place) {
            worker = USER_LNAME;
            if(place==='MenuProject' && ( worker === 'admin' || worker==='yrina' || worker === 'satoshi' ))
                return 1;
            if (worker === 'admin')
                return 1;
            return 0;
        },
        init: function (s) {
            s.load();
            store = s;
        }
    };
})();

var Timer = (function () {

    var task;
    var runner;
    var limit = 600000 * 6;
    var me = this;
    me.time = new Date();
    return {
        get: function () {
            var cur_date = new Date();
            me.clock = (limit - (cur_date - me.time)) / (1000 * 60);
            me.panel.setTitle('<div style="float: right; text-align: right;">' + Ext.Date.format(cur_date, 'g:i:s A') + '&nbsp;(' + me.clock.toFixed() + ')&nbsp;</div>');
            if (cur_date - me.time >= limit) {
                window.location = "login.php?timeout=true";
            }
        },
        set: function () {
            me.time = new Date();
            me.clock = 600;
        },
        init: function (view) {
            me.panel = view;
            if (typeof runner !== 'undefined') return;
            this.set();
            task = {
                run: this.get,
                interval: 5000 //msecs
            }
            runner = new Ext.util.TaskRunner();
            runner.start(task);
        }
    };
})();


var LocalStorage = (function () {
    return {
        FILTER_STORAGE: 1,
        PARAMS_STORAGE: 2,
        DESEQ_STORAGE: 3,
        FILTER_DESEQ: 4,
        ATDP_STORAGE: 5,
        MANORM_STORAGE: 6,

        init: function () {
            var me = this;
            if (!me.store) {
                me.store = Ext.getStore('EMSLocalStorage');
                me.store.load(/*{callback: function(){console.log('loaded',arguments,me.store);}}*/);
            }
            return me.store;
        },

        createData: function (id, json) {
            var me = this;
            me.init();
            var rec = me.findRecord(id);
            if (rec) {
                rec.data.data = json;
                rec.save();
            } else {
                rec = Ext.create('EMS.model.EMSLocalStorage', { 'internalid': id, 'data': json });
                rec.save({
                    success: function () {
                        me.store.add(rec);
                    },
                    failure: function () {
                        console.log('create fail:', arguments);
                    }
                });
            }
        },
        findRecord: function (id) {
            var me = this;
            me.init();
            var index = me.store.findExact('internalid', id);
            if (index >= 0)
                return me.store.getAt(index);
            return undefined;
        },
        findData: function (id) {
            var me = this;
            var record = me.findRecord(id);
            if (typeof record !== 'undefined') {
                return Ext.decode(record.data.data);
            }
            return undefined;
        },
        setParam: function (id, param, val) {
            var me = this;
            var data = me.findData(id);
            if (typeof data === 'undefined') {
                data = {};
            }
            data[param] = val;
            me.createData(id, Ext.encode(data));
        },
        getParam: function (id, param) {
            var me = this;
            var data = me.findData(id);
            if (typeof data === 'undefined') {
                return undefined;
            }
            return data[param];
        }
    };
})();


/******************************************************************
 ******************************************************************/

Ext.application({
    name: 'EMS',

    appFolder: 'app',
    controllers: [
        'EMS.controller.ExperimentTypeEdit', 'EMS.controller.ExperimentsWindow', 'EMS.controller.WorkersEdit', 'EMS.controller.GenomeEdit', 'EMS.controller.AntibodiesEdit', 'EMS.controller.CrosslinkEdit', 'EMS.controller.FragmentationEdit', 'EMS.controller.Spikeins', 'EMS.controller.SequenceCutter', 'EMS.controller.Patients', 'EMS.controller.Project', 'EMS.controller.Project2', 'EMS.controller.Info',
        'EMS.controller.EMSMenu'
    ],

    stores: ['EMSLocalStorage'],
    models: ['EMSLocalStorage'],

    views: [
        'EMSMenu'
    ],


    launch: function () {
        Rights.init(Ext.getStore('Worker'));
        //var STORER = LocalStorage.init();
        //var viewport =
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
                {
                    region: 'north',
                    title: '<div style="float: left; text-align: left;">Allergy department experiments management software</div><div style="float: right; text-align: right;">Wellcome: ' + USER_NAME + "<a href=login.php>&nbsp;logout</a></div>",
                    autoHeight: true
                } ,
                {
                    region: 'south',
                    title: '',
                    id: 'main-south',
                    collapsible: true,
                    collapsed: true,
                    height: 100,
                    minHeight: 60,
                    overflowY: 'scroll',
                    tplWriteMode: 'append',
                    tpl: '<div class="{cls}">[{now:date("H:i:s")}] - {msg}</div>',
                    bodyPadding: 5,
                    listeners: {
                        render: function (p) {
                            Logger.init(p);
                            Timer.init(p);
                        }
                    }
                } ,
                {
                    xtype: 'EMSMenu',
                    id: 'EMSMenu',
                    region: 'center',
                    border: false,
                    layout: 'fit'
                }
            ]//items Viewport
        });//ext create

    }//launch func

});//application

