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

Ext.define( 'EMS.model.ATDPHeatA', {
               extend: 'Ext.data.Model',

               fields: [
                   { name: 'max', type: 'float' },
                   { name: 'cols', type: 'auto' },
                   { name: 'rows', type: 'auto' },
                   { name: 'array', type: 'auto' },
                   { name: 'pltname', type: 'string' },
                   { name: 'tbl1_id', type: 'string' },
                   { name: 'tbl2_id', type: 'string' },
                   { name: 'tbl1_name', type: 'string' },
                   { name: 'tbl2_name', type: 'string' },
                   { name: 'rpkmarray', type: 'auto' },
                   { name: 'rpkmcols', type: 'auto' },
                   { name: 'genebody', type: 'auto' }
               ]
           });
