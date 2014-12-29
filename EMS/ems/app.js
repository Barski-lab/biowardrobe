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
                             'Ext.ux': 'ux',
                             'Chart' : 'Chart'
                         }
                     });

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

     views: [
         'EMSViewport',
         'Login',
         'News',
     ],

     init: function () {

     },

     launch: function () {
         var me = this;
         me.login = true;
         var task = new Ext.util.DelayedTask(function () {
             setTimeout(function () {
                 Ext.get('loading').remove();
                 Ext.get('loading-mask').fadeOut
                 ({
                      duration: 1000,
                      remove: true,
                      listeners: {
                          afteranimate: function (el, startTime, eOpts) {
                              if (me.login) {
                                  Ext.widget('news');
                                  Ext.widget('login');
                              } else {
                                  Ext.create('EMS.view.EMSViewport');
                              }
                          }
                      }
                  });
             }, 50);
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

