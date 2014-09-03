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


Ext.define("EMS.ux.d3heatRNA", {
    extend: 'EMS.ux.d3heat',
    alias: ['widget.d3heatrna'],

    requires: [
        'EMS.ux.d3'
    ],

    //colors: ["blue", "yellow", "orange", "red"],
    colors: ["blue", "yellow", "red"],
    plotTitle: null,
    ChIP: false,

    max: null,
    min: null,

    order: null,

    makeColorScale: function () {
        if (this.min < 0) {
            this.colorScale = d3.scale.linear()
                    .domain([this.min, 0, this.max])
                    .range(this.colors);
        } else {
            var inter = 10;
            if (inter > this.max) inter = this.max / 2;
            this.colorScale = d3.scale.log()
                    .domain([this.min, inter, this.max])
                    .range(this.colors);
        }
    },

    initData: function () {
        if (!this.data && this.store)
            this.data = this.store.getAt(0);
        if (!this.rowsName) {
            this.rowsName = this.data.get('rows');
        }
        if (!this.colsName) {
            this.colsName = this.data.get('rpkmcols');
        }
        if (!this.dataArray) {
            this.dataArray = this.data.get('rpkmarray');
        }
        if (!this.plotTitle && this.data.get('rnapltname')) {
            this.plotTitle = this.data.get('rnapltname');
        }
        var allrpkm = [];
        if (!this.max || !this.min) {
            allrpkm = d3.merge(this.dataArray);
            allrpkm.sort(function (a, b) {
                if (a > b)
                    return 1;
                if (a < b)
                    return -1;
                return 0
            });
        }
        if (!this.min)
            this.min = d3.quantile(allrpkm, 0.05);
        if(this.min==0)
            this.min=0.1;
        if (!this.max)
            this.max = d3.quantile(allrpkm, 0.95);
    },


});
