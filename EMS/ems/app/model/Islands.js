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

Ext.define('EMS.model.Islands', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'refseq_id', type: 'string' },
        { name: 'gene_id', type: 'string' },
        { name: 'txStart', type: 'int' },
        { name: 'txEnd', type: 'int' },
        { name: 'strand', type: 'string' },
        { name: 'region', type: 'string' },

        { name: 'chrom', type: 'string' },
        { name: 'start', type: 'int' },
        { name: 'end', type: 'int' },
        { name: 'length', type: 'int' },
        { name: 'abssummit', type: 'int' },
        { name: 'pileup', type: 'float' },
        { name: 'log10p', type: 'float' },
        { name: 'foldenrich', type: 'float' },
        { name: 'log10q', type: 'float' }
    ]
});
