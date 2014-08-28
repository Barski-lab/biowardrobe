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


Ext.define("EMS.ux.d3heatChIP", {
    extend: 'EMS.ux.d3heat',
    alias: ['widget.d3heatchip'],

    requires: [
        'EMS.ux.d3',
        'EMS.ux.d3heat'
    ],

    //height of each row in the heatmap
    heatHeight: 1,
    //width of each column in the heatmap
    heatWidth: 1,
    maxHeatWidth: 250,
    maxHeatHeight: 2000,

    rowsName: null,
    colsName: null,
    colors: ["white", "blue"],
    plotTitle: "",
    plotmargin: { top: 30, right: 20, bottom: 20, left: 10 },
    ChIP: true,

    max: 0,
    min: 0,

});
