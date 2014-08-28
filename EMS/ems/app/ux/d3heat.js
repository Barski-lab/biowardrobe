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

    border: false,

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

    max: 0,
    min: 0,

    order: null,

    makeColorScale: function () {
        this.colorScale = d3.scale.linear()
                .domain([this.min, this.max])
                .range(this.colors);
    },

    initData: function () {
        if (!this.data && this.store)
            this.data = this.store.getAt(0);
        if (!this.rowsName) {
            this.rowsName = this.data.get('rows');
        }
        if (!this.colsName) {
            this.colsName = this.data.get('cols');
        }
        if (!this.max) {
            this.max = this.data.get('max');
        }
        if (!this.dataArray) {
            this.dataArray = this.data.get('array');
        }
        if (!this.plotTitle && this.data.get('pltname')) {
            this.plotTitle = this.data.get('pltname');
        }
    },

    estimateSize: function () {
        var _this = this;

        var h = this.getHeight();
        h -= (this.plotmargin.top + this.plotmargin.bottom);
        this.heatHeight = h / this.rowsName.length;

        var w = (this.getWidth() > this.maxHeatWidth) ? this.maxHeatWidth : this.getWidth();
        w -= (this.plotmargin.right + this.plotmargin.left);
        this.heatWidth = w / this.colsName.length;

        this.pictureWidth = w;
        this.pictureHight = h;
    },

    plotUpdate: function () {
        var _this = this;
        this.estimateSize();

        _this.heatmapRow
                .selectAll("rect")
            //.attr("class", "cell")
                .attr('width', _this.heatWidth)
                .attr('height', _this.heatHeight)
                .attr('x', function (d, i, j) {
                          return (i * _this.heatWidth) + _this.plotmargin.left;
                      })
                .attr('y', function (d, i, l) {
                          var j = l;
                          if (_this.order) {
                              j = _this.order[l];
                          }
                          return (j * _this.heatHeight) + _this.plotmargin.top;
                      })
                .style('fill', function (d) {
                           return _this.colorScale(d);
                       });
        this.addColumnLabels();
        this.addLegend();
    },

    plot: function () {
        var _this = this;

        this.makeColorScale();
        this.estimateSize();
        //generate the heatmap

        var w = this.pictureWidth;
        var h = this.pictureHight;

        this.expLab = d3.select(this.panelId)
                .append('div')
                .style('height', 'auto')
                .style('position', 'absolute')
                .style('background', '#C3C3CB')
                .style('opacity', 0.6)
                .style('top', 0)
                .style('padding', 5)
                .style('left', this.plotmargin.left - this.plotmargin.left / 2)
                .style('display', 'none');

        _this.heatmapRow = this.chart.selectAll("heatmap")
                .data(this.dataArray)
                .enter().append("g");

        _this.heatmapRow
                .selectAll("rect")
                .data(function (d) {
                          return d;
                      }).enter().
                append("svg:rect")
            //.attr("class", "cell")
                .attr('width', _this.heatWidth)
                .attr('height', _this.heatHeight)
                .attr('x', function (d, i, j) {
                          return (i * _this.heatWidth) + _this.plotmargin.left;
                      })
                .attr('y', function (d, i, l) {
                          var j = l;
                          if (_this.order) {
                              j = _this.order[l];
                          }
                          return (j * _this.heatHeight) + _this.plotmargin.top;
                      })
                .style('fill', function (d) {
                           return _this.colorScale(d);
                       });

        _this.heatmapRow
                .on('mouseover', function (d, l) {
                        d3.select(this)
                                .attr('stroke-width', 1)
                                .attr('stroke', 'black');
                        var i = l;
                        if (_this.order) {
                            i = _this.order[l];
                        }
                        output = '<b>' + _this.rowsName[i] + '</b>';
                        if (!_this.ChIP) {
                            output += '<br>';
                            for (var j = 0; j < d.length; j++)
                                output += d[j].toFixed(1) + '; '
                        }

                        _this.expLab
                                .style('top', (i * _this.heatHeight-8))
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

        this.addColumnLabels();
        this.addTitle();
        this.addLegend();
    },

    destroy: function () {
        var _this = this;
        console.log("destroyed heat");
        if (this.expLab) {
            this.expLab.remove();
            //delete this.expLab;
        }
        this.callParent(arguments);
    },

    addColumnLabels: function () {
        //label columns
        var _this = this;
        var w = this.pictureWidth;
        var colfontsize = 12;
        if (!this.ChIP) {
            colfontsize = (w / (this.colsName.length * 20)) * (4.5);
            if (colfontsize > 12) colfontsize = 12;
        }

        if (this.columnLabel)
            this.chart.selectAll('.collabel').remove();
        this.columnLabel = this.chart.selectAll('.collabel')
                .data(this.colsName)
                .enter().append('svg:text')
                .attr('x', function (d, i) {
                          return ((i + 0.5) * _this.heatWidth) + _this.plotmargin.left;
                      })
                .attr('y', this.getHeight() - _this.plotmargin.bottom / 2 + 3)
                .attr('class', 'collabel')
                .attr('font-size', colfontsize)
                .style('text-anchor', 'middle')
                .text(function (d) {
                          return d;
                      });
    },

    addTitle: function () {
        var _this = this;
        var w = this.pictureWidth;
        var fontsize = (w / this.plotTitle.length) * (2.2);
        if (fontsize > 20) fontsize = 20;
        var title = this.chart
                .append('svg:text')
                .attr('x', _this.pictureWidth / 2 + _this.plotmargin.left)
                .attr('y', _this.plotmargin.top / 2 + 1)
                .attr('class', 'title')
                .attr('font-size', fontsize)
                .style('text-anchor', 'middle')
                .text(this.plotTitle);
    },

    addLegend: function () {
        var _this = this;
        var legdata = [];
        var legendElementWidth = 5;
        var legendElementHight = 5;
        var grad = 50;
        if (this.ChIP)
            grad = 20;
        var h = this.getHeight();
        var w = (this.getWidth() > this.maxHeatWidth) ? this.maxHeatWidth : this.getWidth();

        var cellHeight = this.pictureHight / grad;

        for (var i = 0.1; i < (this.max); i += (this.max / grad)) {
            legdata.push(i);
        }

        h -= this.plotmargin.bottom; // either -cellHeight or (i+1)
        w -= this.plotmargin.right;


        if (this.legend) {
            console.log(this.legend[0]);
            this.legend
                    .selectAll(".legend")
                    .attr('class', 'legend')
                    .attr('width', legendElementWidth)
                    .attr('height', cellHeight)
                    .attr('x', function (d, i, j) {
                              return w + legendElementWidth;
                          })
                    .attr('y', function (d, i, j) {
                              return h - cellHeight * (i + 1);
                          })
                    .style('fill', function (d) {
                               return _this.colorScale(d);
                           });
        } else {
            this.legend = this.chart.append("g");
            this.legend
                    .selectAll(".legend")
                    .data(legdata)
                    .enter().append("svg:rect")
                    .attr('class', 'legend')
                    .attr('width', legendElementWidth)
                    .attr('height', cellHeight)
                    .attr('x', function (d, i, j) {
                              return w + legendElementWidth;
                          })
                    .attr('y', function (d, i, j) {
                              return h - cellHeight * (i + 1);
                          })
                    .style('fill', function (d) {
                               return _this.colorScale(d);
                           });
        }
        if (this.legendLabel)
            this.chart.selectAll('.legendlabel').remove();
        this.legendLabel = this.chart.selectAll('.legendlabel')
                .data([this.min,this.max])
                .enter().append('svg:text')
                .attr('x', function (d, i, j) {
                          return w + legendElementWidth+6;
                      })
                .attr('y', function (d, i, j) {
                                                     console.log(arguments);
                          return h - cellHeight *d ;
                      })
                .attr('class', 'legendlabel')
                .attr('font-size', 12)
                .style('text-anchor', 'middle')
                .text(function (d) {
                          return d;
                      });

    },

    reorder: function (indices) {//to reset post null
        var _this = this;
        this.order = indices;
        if (indices) {
            _this.heatmapRow
                    .selectAll("rect")
                    .attr("y", function (d, i, j) {
                              return (indices[j] * _this.heatHeight) + _this.plotmargin.top;
                          });
        } else {
            _this.heatmapRow
                    .selectAll("rect")
                    .attr("y", function (d, i, j) {
                              return (j * _this.heatHeight) + _this.plotmargin.top;
                          });
        }

    }


});
