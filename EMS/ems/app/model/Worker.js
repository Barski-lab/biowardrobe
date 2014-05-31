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

Ext.define('EMS.model.Worker', {
    extend: 'Ext.data.Model',
    idProperty: 'id',

    fields: [
        { name: 'id', type: 'int'},
        { name: 'worker', type: 'string' },
        { name: 'passwd', type: 'string' },
        { name: 'fname', type: 'string' },
        { name: 'lname', type: 'string' },
        { name: 'dnalogin', type: 'string' },
        { name: 'dnapass', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'notify', type: 'int' },
        { name: 'newpass', type: 'string' },
        { name: 'changepass', type: 'int' },
        { name: 'relogin', type: 'int' },
        { name: 'admin', type: 'int' },
        { name: 'laboratory_id', type: 'string' },
        { name: 'isa', type: 'boolean', persist: false },
        { name: 'isla', type: 'boolean', persist: false },
        { name: 'fullname', mapping: null, type: 'string', persist: false,
            convert: function (value, record) {
                var fn = record.get('fname');
                var ln = record.get('lname');

                if (fn !== "" && ln !== "") return ln + ', ' + fn;
                if (ln !== "") return ln;
                return fn;
            }
        }
    ]
});
