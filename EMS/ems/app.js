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


Ext.Loader.setConfig({
                         enabled: true,
                         paths: {
                             //Ext: '.',
                             'Ext.ux': 'ux'
                         }
                     });

//var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
//
//function generateUUID() {
//    var d = new Date().getTime();
//    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//        var r = (d + Math.random() * 16) % 16 | 0;
//        d = Math.floor(d / 16);
//        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
//    });
//    return uuid;
//};


//var LocalStorage = (function () {
//    return {
//        FILTER_STORAGE: 1,
//        PARAMS_STORAGE: 2,
//        DESEQ_STORAGE: 3,
//        FILTER_DESEQ: 4,
//        ATDP_STORAGE: 5,
//        MANORM_STORAGE: 6,
//
//        init: function () {
//            var me = this;
//            if (!me.store) {
//                me.store = Ext.getStore('EMSLocalStorage');
//                me.store.load(/*{callback: function(){console.log('loaded',arguments,me.store);}}*/);
//            }
//            return me.store;
//        },
//
//        createData: function (id, json) {
//            var me = this;
//            me.init();
//            var rec = me.findRecord(id);
//            if (rec) {
//                rec.data.data = json;
//                rec.save();
//            } else {
//                rec = Ext.create('EMS.model.EMSLocalStorage', { 'internalid': id, 'data': json });
//                rec.save({
//                             success: function () {
//                                 me.store.add(rec);
//                             },
//                             failure: function () {
//                                 console.log('create fail:', arguments);
//                             }
//                         });
//            }
//        },
//        findRecord: function (id) {
//            var me = this;
//            me.init();
//            var index = me.store.findExact('internalid', id);
//            if (index >= 0)
//                return me.store.getAt(index);
//            return undefined;
//        },
//        findData: function (id) {
//            var me = this;
//            var record = me.findRecord(id);
//            if (typeof record !== 'undefined') {
//                return Ext.decode(record.data.data);
//            }
//            return undefined;
//        },
//        setParam: function (id, param, val) {
//            var me = this;
//            var data = me.findData(id);
//            if (typeof data === 'undefined') {
//                data = {};
//            }
//            data[param] = val;
//            me.createData(id, Ext.encode(data));
//        },
//        getParam: function (id, param) {
//            var me = this;
//            var data = me.findData(id);
//            if (typeof data === 'undefined') {
//                return undefined;
//            }
//            return data[param];
//        }
//    };
//})();


/******************************************************************
 ******************************************************************/

    //http://stackoverflow.com/questions/15834689/extjs-4-2-tooltips-not-wide-enough-to-see-contents
delete Ext.tip.Tip.prototype.minWidth;

Ext.application
({
     name: 'EMS',

     appFolder: 'app',
     controllers: [
         'Login',
         'EMSViewport'
     ],
     requires: [
         'EMS.util.Util'
     ],

     //     stores: ['EMSLocalStorage'],
     //     models: ['EMSLocalStorage'],

     views: [
         'EMSViewport',
         'Login'
     ],

     splashscreen: {},

     init: function () {
         splashscreen = Ext.getBody().mask('Wardrobe is loading...', 'splashscreen');
         splashscreen.addCls('splashscreen');
         Ext.DomHelper.insertFirst(Ext.query('.x-mask-msg')[0], {
             cls: 'x-splash-icon'
         });
     },

     launch: function () {
         var me = this;
         me.login = true;
         var task = new Ext.util.DelayedTask(function () {
             //Fade out the body mask
             splashscreen.fadeOut
             ({
                  duration: 1000,
                  remove: true
              });
             splashscreen.next().fadeOut
             ({
                  duration: 1000,
                  remove: true,
                  listeners: {
                      afteranimate: function (el, startTime, eOpts) {
                          if (me.login) {
                              Ext.widget('login');
                          } else {
                              Ext.create('EMS.view.EMSViewport');
                          }
                      }
                  }
              });
         });
         Ext.Ajax.request
         ({
              url: 'authenticate.php',
              success: function (conn, response, options, eOpts) {
                  var result = EMS.util.Util.decodeJSON(conn.responseText);
                  if (result.success) {
                      me.login = false;
                  }
                  task.delay(500);
              },
              failure: function (conn, response, options, eOpts) {
                  task.delay(500);
              }
          });

     }//launch func

 });//application

