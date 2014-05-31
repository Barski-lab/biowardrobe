/****************************************************************************
 **
 ** Copyright (C) 2011-2014 Andrey Kartashov .
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
Ext.define
('EMS.controller.EMSViewport',
 {
     extend: 'Ext.app.Controller',
     requires: [
         'EMS.util.SessionMonitor',
         'EMS.util.Util'
     ],
     models: ['Worker','Laboratory','Preferences'],
     stores: ['Worker','Laboratories','Preferences'],
     views: ['EMSViewport', 'toolbar.EMSMenu'],
     worker: {},
     init: function () {
         this.control({
                          'viewport > panel[region=south]': {
                              afterrender: this.onLogPanelRender
                          },
                          'viewport > toolbar#title': {
                              render: this.onTitleRender
                          }
                      });
     },

     onLogPanelRender: function (p) {
         EMS.util.SessionMonitor.start(p);
         EMS.util.Util.Logger.init(p);
     },

     onTitleRender: function (p) {
         this.worker = this.getWorkerStore();
         this.worker.load
         ({
              scope: this,
              callback: function () {
                  this.worker = this.worker.getAt(0);
                  this.getLaboratoriesStore().load();
                  this.getPreferencesStore().load();

                  this.getController('EMSMenu');

                  this.getController('AntibodiesEdit');
                  this.getController('CrosslinkEdit');
                  this.getController('FragmentationEdit');
                  this.getController('Spikeins');

                  this.getController('GenomeEdit');
                  this.getController('SequenceCutter');
                  this.getController('Info');

                  //                  this.getController('ExperimentTypeEdit');
                  this.getController('Experiment.LabData');
                  this.getController('Experiment.Experiment');
                  this.getController('Experiment.EGroup');
                  this.getController('Project2');

                  p.insert(0,
                           Ext.create('Ext.form.Label',
                                      {
                                          html: '<div style="float: left; text-align: left; color: #4c72a4; font-weight:bold;">WARDROBE: experiment management software welcomes ' + this.worker.data.fullname + "</div>"
                                      })
                  );

                  if(this.worker.data.isa) {
                      this.getController('Preferences');
                  }
                  if(this.worker.data.isa || this.worker.data.isla) {
                      this.getController('User.UsersGroups');
                  }
                  this.getController('User.Preferences');

              }
          });
     }
 });//ext def
