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

Ext.define( 'EMS.model.SpikeinsChart', {
               extend: 'Ext.data.Model',

               fields: [
                   { name: 'id', type: 'int' },
                   { name: 'spikeins_id', type: 'int' },
                   { name: 'name', type: 'string' },
                   { name: 'concentration', type: 'float' },
                   { name: 'TOT_R_0', type: 'int' },
                   { name: 'RPKM_0', type: 'float' },
                   { name: 'slope', type: 'float' },
                   { name: 'inter', type: 'float' },
                   { name: 'R', type: 'float' },
                   { name: 'line', mapping: null, type: 'double', persist: false,
                       convert: function(value, record) {
                           var slope = record.get('slope');
                           var inter = record.get('inter');
                           var conc = record.get('concentration');
                           if(slope!==0) {
                               return conc/slope-inter;//.toFixed(2);
                           } else {
                               return 0.0;
                           }
                       }
                   },
                   { name: 'first', mapping: null, type: 'int', persist: false,
                       convert: function(value, record) {
                               return 0;
                       }
                   }
               ]
           });
