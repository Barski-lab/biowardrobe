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
    padding: 3,
    maxHeatWidth: 350,
    maxHeatHeight: 2000,

    rowsName: null,
    colsName: null,
    colors: ["white", "blue"],
    plotTitle: "",
    plotmargin: { top: 30, right: 35, bottom: 20, left: 10 },

    max: 0,
    min: 0,

    order: null,

    skip: null,

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

        if (this.heatHeight < 0.6) {
            this.skip = Math.floor(0.7 / this.heatHeight);
            this.heatHeight = h / (this.rowsName.length / this.skip);
        } else {
            this.skip = 1;
        }

        var w = (this.getWidth() > this.maxHeatWidth) ? this.maxHeatWidth : this.getWidth();
        w -= (this.plotmargin.right + this.plotmargin.left);
        this.heatWidth = w / this.colsName.length;

        this.pictureWidth = w;
        this.pictureHight = h;
    },

    plotUpdate: function () {
        this.plot();
    },

    _newOrder: function () {
        var rArray = this.dataArray;
        if (this.order) {
            rArray = new Array(this.dataArray.length);
            for (var i = 0; i < this.dataArray.length; i++) {
                rArray[this.order[i]] = this.dataArray[i];
            }
        }
        return rArray;
    },
    _makeArrays: function () {
        var _this = this;
        if (this.skip == 1) {
            this._dataArray = this._newOrder();
        } else {
            this._dataArray = this._newOrder().filter(
                    function (d, i) {
                        return (i % _this.skip) == 0;
                    });
        }
    },

    _makeHeatmapPlot: function () {
        if (this.heatmapRow)
            this.heatmapRow.remove();
        this.heatmapRow = this.chart.selectAll(".heatmaprow")
                .data(this._dataArray)
                .enter().append("g")
                .attr("class", "heatmaprow");
    },

    plot: function () {
        var _this = this;

        this.makeColorScale();
        this.estimateSize();
        if (this.pictureWidth < 0 || this.pictureHight < 0)
            return;
        this._makeArrays();
        this._makeHeatmapPlot();

        _this.heatmapRow
                .selectAll("rect")
                .data(function (d) {
                          return d;
                      }).enter()
                .append("svg:rect")
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

        //        _this.heatmapRow
        //                .on('mouseover', function (d, l) {
        //                        d3.select(this)
        //                                .attr('stroke-width', 1)
        //                                .attr('stroke', 'black');
        //                        var i = l;
        //                        if (_this.order) {
        //                            i = _this.order[l];
        //                        }
        //                        output = '<b>' + _this.rowsName[i] + '</b>';
        //                        if (!_this.ChIP) {
        //                            output += '<br>';
        //                            for (var j = 0; j < d.length; j++)
        //                                output += d[j].toFixed(1) + '; '
        //                        }
        //
        //                        _this.expLab
        //                                .style('top', (i * _this.heatHeight - 10))
        //                                .style('display', 'block')
        //                                .html(output);
        //                    })
        //                .on('mouseout', function (d, i) {
        //                        d3.select(this)
        //                                .attr('stroke-width', 0)
        //                                .attr('stroke', 'none');
        //
        //                        _this.expLab
        //                                .style('display', 'none');
        //                    });

        this.addColumnLabels();
        this.addTitle();
        this.addLegend();
    },

    addColumnLabels: function () {
        //label columns
        var _this = this;
        var w = this.pictureWidth;

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
                .attr('font-size', function (d, i) {
                          var wcl = w / _this.colsName.length;
                          wcl = wcl / d.length;
                          if (wcl < 6 || wcl > 10)
                              wcl = 9;
                          if (!_this.ChIP) {
                              return wcl;
                          } else return 11;
                      })
                .style('text-anchor', 'middle')
                .text(function (d) {
                          var wcl = w / _this.colsName.length;
                          wcl = wcl / d.length;
                          if (wcl < 6) {
                              wcl = 9;
                          }
                          var vlen = (w / _this.colsName.length) / 6.4;

                          if (d.length > vlen + 2 && _this.colsName.length != 1 && !_this.ChIP) {
                              return d.substring(0, vlen) + "...";
                          } else {
                              return d;
                          }
                      });
    },

    addTitle: function () {
        var _this = this;
        var fontsize = (this.pictureWidth / this.plotTitle.length) * (2);
        if (fontsize > 18) fontsize = 18;

        console.log(fontsize);

        if (this.__title)
            this.__title.remove();

        this.__title = this.chart
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

        var grad = 25;

        var cellHeight = this.pictureHight / grad;
        var leglen = this.max - this.min;

        for (var i = this.min; i < this.max && legdata.length < grad; i += leglen / grad) {
            legdata.push(i);
        }

        var h = this.pictureHight + this.plotmargin.top; // either -cellHeight or (i+1)
        var w = this.pictureWidth + this.plotmargin.left;


        if (this.legend) {
            this.legend.remove();
        }
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

        if (this.legendLabel) {
            this.chart.selectAll('.legendlabel').remove();
        }
        this.legendLabel = this.chart.selectAll('.legendlabel')
                .data([this.min, this.max])
                .enter().append('svg:text')
                .attr('x', function (d, i, j) {
                          return w + legendElementWidth * 3.6;
                      })
                .attr('y', function (d, i, j) {
                          return h - i * (cellHeight * grad - 10);
                      })
                .attr('class', 'legendlabel')
                .attr('font-size', 10)
                .style('text-anchor', 'middle')
                .text(function (d) {
                          var post = "";
                          if (d > 1000) {
                              d = d / 1000;
                              post = "k";
                          }
                          return d.toFixed(0) + post;
                      });

    },

    reorder: function (indices) {//to reset post null
        var _this = this;
        this.order = indices;
        this.plot();
    }


});
