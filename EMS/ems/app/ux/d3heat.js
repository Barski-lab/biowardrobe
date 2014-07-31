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


Ext.define("EMS.ux.d3heat", {
    extend: 'EMS.ux.d3',
    alias: ['widget.d3heat'],

    requires: [
        'EMS.ux.d3'
    ],

    //height of each row in the heatmap
    heatHeight: 0.03,
    //width of each column in the heatmap
    heatWidth: 5,

    rowsName: null,
    colsName: null,
    colors: ["white", "blue"],
    plotTitle: "",
    plotmargin: { top: 30, right: 30, bottom: 20, left: 70 },

    plot: function () {
        var _this = this;
        this.rowsName = this.store.getAt(0).get('rows');
        this.colsName = this.store.getAt(0).get('cols');
        this.max = this.store.getAt(0).get('max');
        this.dataArray = this.store.getAt(0).get('array');

        //generate the heatmap
        var h = this.getHeight();
        h -= (_this.plotmargin.top + _this.plotmargin.bottom);
        this.heatHeight = h / this.rowsName.length;

        //        console.log(this.heatHeight);

        this.colorScale = d3.scale.linear()
                .domain([0, this.max])
                .range(this.colors);

        var heatmapRow = this.chart.selectAll(".heatmap")
                .data(this.dataArray)
                .enter().append("g");

        var heatmapRects = heatmapRow
                .selectAll(".rect")
                .data(function (d) {
                          return d;
                      }).enter().append("svg:rect")
                .attr('width', _this.heatWidth)
                .attr('height', _this.heatHeight)
                .attr('x', function (d, i, j) {
                          return (i * _this.heatWidth) + _this.plotmargin.left;
                      })
                .attr('y', function (d, i, j) {
                          return (j * _this.heatHeight) + _this.plotmargin.top;
                      })
                .style('fill', function (d) {
                           return _this.colorScale(d);
                       });

        //label columns
        var columnLabel = this.chart.selectAll(".colLabel")
                .data(this.colsName)
                .enter().append('svg:text')
                .attr('x', function (d, i) {
                          return ((i + 0.5) * _this.heatWidth) + _this.plotmargin.left;
                      })
                .attr('y', this.getHeight() - _this.plotmargin.bottom / 2 + 3)
                .attr('class', 'label')
                .style('text-anchor', 'middle')
                .text(function (d) {
                          return d;
                      });
        var title = this.chart
                .append('svg:text')
                .attr('x', _this.heatWidth * _this.colsName.length / 2 + _this.plotmargin.left - 5)
                .attr('y', _this.plotmargin.top / 2 + 1)
                .attr('class', 'label')
                .style('text-anchor', 'middle')
                .text(this.plotTitle);

        //expression value label
        this.expLab = d3.select(this.el.dom)
                .append('div')
                .style('height', 'auto')
                .style('position', 'absolute')
                .style('background', '#C3C3CB')
                .style('opacity', 0.6)
                .style('top', 0)
                .style('padding', 10)
                .style('left', 30)
                .style('display', 'none');
        heatmapRow
                .on('mouseover', function (d, i) {
                        d3.select(this)
                                .attr('stroke-width', 1)
                                .attr('stroke', 'black');

                        output = '<b>' + _this.rowsName[i] + '</b>';

                        _this.expLab
                                .style('top', (i * _this.heatHeight))
                                .style('display', 'block')
                                .html(output);
                    })
                .on('mouseout', function (d, i) {
                        d3.select(this)
                                .attr('stroke-width', 0)
                                .attr('stroke', 'none');

                        _this.expLab
                                .style('display', 'none');
                    });
    },
    destroy: function () {
        var _this = this;
        console.log("destroyed heat");
        if (this.expLab) {
            this.expLab.remove();
            delete this.expLab;
        }
        this.callParent(arguments);
    },


});
