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
Ext.define
('EMS.controller.EMSViewport',
 {
     extend: 'Ext.app.Controller',

     views: ['EMSViewport','EMSMenu'],
     init: function() {
         this.control({
                          'viewport > panel': {
                              render: this.onPanelRendered
                          }
                      });
     },

     onPanelRendered: function() {
         this.getController('EMSMenu');
         this.getController('ExperimentTypeEdit');
         this.getController('ExperimentsWindow');
         this.getController('WorkersEdit');
         this.getController('GenomeEdit');
         this.getController('AntibodiesEdit');
         this.getController('CrosslinkEdit');
         this.getController('FragmentationEdit');
         this.getController('Spikeins');
         this.getController('SequenceCutter');
         this.getController('Project2');
         this.getController('Info');
     },

//             listeners: {
//                 render: function (p) {
//                     Logger.init(p);
//                     Timer.init(p);
//                 }
//             }
//         } ,
});//ext def
