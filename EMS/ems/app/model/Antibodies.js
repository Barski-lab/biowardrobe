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
Ext.define('EMS.model.Antibodies', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'string', persist: true  },
        { name: 'antibody', header: 'Antibody', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'properties', header: 'Property', type: 'int',
            editor: {
                xtype: "combobox",
                store: {
                    proxy: {
                        type: 'memory',
                        reader: 'array'
                    },
                    fields: [
                        'id', 'name'
                    ],
                    data: [
                        [0, "N/A"],
                        [1, "narrow"],
                        [2, "wide"]
                    ],
                },
                editable: false,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id'
            },
            renderer: function (value, meta, record) {
                var data = [
                    "N/A",
                    "narrow",
                    "wide"
                ];
                return data[value];
            }
        }
    ]/*,
     set: function (fieldName, value) {
     this.callParent(arguments);
     if (fieldName === 'firstName' || fieldName === 'lastName') {
     this.set('fullName');
     }
     }*/
});
