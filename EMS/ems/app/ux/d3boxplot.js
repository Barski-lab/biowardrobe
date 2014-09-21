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


Ext.define("EMS.ux.d3boxplot", {
    extend: 'EMS.ux.d3',
    alias: ['widget.d3boxplot'],

    requires: [
        'EMS.ux.d3'
    ],

    border: false,

    padding: 3,

    rowsName: null,
    colsName: null,
    colors: ["white", "blue"],
    plotTitle: "",
    plotmargin: {top: 30, right: 50, bottom: 80, left: 50},

    max: 0,
    min: 0,

    duration: 2000,
    showLabels: false,

    constructor: function (config) {
        this.callParent(arguments);
        Ext.apply(this, config);
        var me = this;

        d3.box = function () {
            var width = 1,
                    height = 1,
                    duration = 1000,//config.duration,
                    showLabels = false,//config.showLabels,
                    numBars = 4,
                    curBar = 1,
                    tickFormat = null;

            // For each small multiple…
            function box(g) {
                g.each(function (d, i) {

                    var g = d3.select(this),
                            min = d.data.min,
                            max = d.data.max;
                    var quartileData = [d.data.Q1, d.data.med, d.data.Q3];
                    var whiskerData = [d.data.lW, d.data.rW];

                    // Compute the new x-scale.
                    var x1 = d3.scale.linear()
                            .domain([min, max])
                            .range([height + me.plotmargin.top, me.plotmargin.top]);

                    // Retrieve the old x-scale, if this is an update.
                    var x0 = this.__chart__ || d3.scale.linear()
                                    .domain([0, Infinity])
                                    .range(x1.range());
                    // Stash the new scale.
                    this.__chart__ = x1;
                    // Note: the box, median, and box tick elements are fixed in number,
                    // so we only have to handle enter and update. In contrast, the outliers
                    // and other elements are variable, so we need to exit them! Variable
                    // elements also fade in and out.

                    // Update center line: the vertical line spanning the whiskers.
                    var center = g.selectAll("line.center")
                            .data([d.data]);

                    //vertical line
                    center.enter().insert("line", "rect")
                            .attr("class", "center")
                            .style("fill", "steelblue")
                            .style("stroke", "#000")
                            .style("stroke-width", "1px")
                            .style("stroke-dasharray", "3,3")
                            .attr("x1", width / 2)
                            .attr("y1", function (d) {
                                      return x0(d.lW);
                                  })
                            .attr("x2", width / 2)
                            .attr("y2", function (d) {
                                      return x0(d.rW);
                                  })
                            .style("opacity", 1e-6)
                            .transition()
                            .duration(duration)
                            .style("opacity", 1)
                            .attr("y1", function (d) {
                                      return x1(d.lW);
                                  })
                            .attr("y2", function (d) {
                                      return x1(d.rW);
                                  });
                    center.transition()
                            .duration(duration)
                            .style("opacity", 1)
                            .attr("y1", function (d) {
                                      return x1(d.lW);
                                  })
                            .attr("y2", function (d) {
                                      return x1(d.rW);
                                  });

                    center.exit().transition()
                            .duration(duration)
                            .style("opacity", 1e-6)
                            .attr("y1", function (d) {
                                      return x1(d.lW);
                                  })
                            .attr("y2", function (d) {
                                      return x1(d.rW);
                                  })
                            .remove();


                    // Update innerquartile box.
                    var box = g.selectAll("rect.d3box")
                            .data([d.data]);

                    box.enter().append("rect")
                            .attr("class", "d3box")
                            .style("fill", "steelblue")
                            .style("stroke", "#000")
                            .style("stroke-width", "1px")
                            .attr("x", 0)
                            .attr("y", function (d) {
                                      return x0(d.Q3);
                                  })
                            .attr("width", width)
                            .attr("height", function (d) {
                                      return x0(d.Q1) - x0(d.Q3);
                                  })
                            .transition()
                            .duration(duration)
                            .attr("y", function (d) {
                                      return x1(d.Q3);
                                  })
                            .attr("height", function (d) {
                                      return x1(d.Q1) - x1(d.Q3);
                                  });

                    box.transition()
                            .duration(duration)
                            .attr("y", function (d) {
                                      return x1(d.Q3);
                                  })
                            .attr("height", function (d) {
                                      return x1(d.Q1) - x1(d.Q3);
                                  });

                    // Update median line.
                    var medianLine = g.selectAll("line.median")
                            .data([d.data.med]);

                    medianLine.enter().append("line")
                            .attr("class", "median")
                            .style("fill", "steelblue")
                            .style("stroke", "#000")
                            .style("stroke-width", "1px")
                            .attr("x1", 0)
                            .attr("y1", x0)
                            .attr("x2", width)
                            .attr("y2", x0)
                            .transition()
                            .duration(duration)
                            .attr("y1", x1)
                            .attr("y2", x1);

                    medianLine.transition()
                            .duration(duration)
                            .attr("y1", x1)
                            .attr("y2", x1);

                    // Update whiskers.
                    var whisker = g.selectAll("line.whisker")
                            .data(whiskerData || []);

                    whisker.enter().insert("line", "circle, text")
                            .attr("class", "whisker")
                            .style("fill", "steelblue")
                            .style("stroke", "#000")
                            .style("stroke-width", "1px")
                            .attr("x1", 0)
                            .attr("y1", x0)
                            .attr("x2", 0 + width)
                            .attr("y2", x0)
                            .style("opacity", 1e-6)
                            .transition()
                            .duration(duration)
                            .attr("y1", x1)
                            .attr("y2", x1)
                            .style("opacity", 1);

                    whisker.transition()
                            .duration(duration)
                            .attr("y1", x1)
                            .attr("y2", x1)
                            .style("opacity", 1);

                    whisker.exit().transition()
                            .duration(duration)
                            .attr("y1", x1)
                            .attr("y2", x1)
                            .style("opacity", 1e-6)
                            .remove();

                    //// Update outliers.
                    //var outlier = g.selectAll("circle.outlier")
                    //    .data(outlierIndices, Number);
                    //
                    //outlier.enter().insert("circle", "text")
                    //    .attr("class", "outlier")
                    //    .attr("r", 5)
                    //    .attr("cx", width / 2)
                    //    .attr("cy", function(i) { return x0(d[i]); })
                    //    .style("opacity", 1e-6)
                    //  .transition()
                    //    .duration(duration)
                    //    .attr("cy", function(i) { return x1(d[i]); })
                    //    .style("opacity", 1);
                    //
                    //outlier.transition()
                    //    .duration(duration)
                    //    .attr("cy", function(i) { return x1(d[i]); })
                    //    .style("opacity", 1);
                    //
                    //outlier.exit().transition()
                    //    .duration(duration)
                    //    .attr("cy", function(i) { return x1(d[i]); })
                    //    .style("opacity", 1e-6)
                    //    .remove();

                    // Compute the tick format.
                    var format = tickFormat || x1.tickFormat(8);

                    // Update box ticks.
                    var boxTick = g.selectAll("text.d3box")
                            .data(quartileData);
                    if (showLabels == true) {
                        boxTick.enter().append("text")
                                .attr("class", "d3box")
                                .attr("dy", ".3em")
                            //.attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
                            //.attr("x", function(d, i) { return i & 1 ?  + width : 0 })
                                .attr("x", width)
                                .attr("y", x0)
                            //.attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
                                .attr("text-anchor", function (d, i) {
                                          return "start";
                                      })
                                .text(format)
                                .transition()
                                .duration(duration)
                                .attr("y", x1);
                    }

                    boxTick.transition()
                            .duration(duration)
                            .text(format)
                            .attr("y", x1);

                    // Update whisker ticks. These are handled separately from the box
                    // ticks because they may or may not exist, and we want don't want
                    // to join box ticks pre-transition with whisker ticks post-.
                    var whiskerTick = g.selectAll("text.whisker")
                            .data(whiskerData || []);
                    if (showLabels == true) {
                        whiskerTick.enter().append("text")
                                .attr("class", "whisker")
                            //.attr("dy", ".3em")
                                .attr("dx", -1)
                                .attr("x", width)
                                .attr("y", x0)
                                .text(format)
                                .style("opacity", 1e-6)
                                .transition()
                                .duration(duration)
                                .attr("y", x1)
                                .style("opacity", 1);
                    }
                    whiskerTick.transition()
                            .duration(duration)
                            .text(format)
                            .attr("y", x1)
                            .style("opacity", 1);

                    whiskerTick.exit().transition()
                            .duration(duration)
                            .attr("y", x1)
                            .style("opacity", 1e-6)
                            .remove();
                });
                d3.timer.flush();
            }

            box.width = function (x) {
                if (!arguments.length) return width;
                width = x;
                return box;
            };

            box.height = function (x) {
                if (!arguments.length) return height;
                height = x;
                return box;
            };

            box.tickFormat = function (x) {
                if (!arguments.length) return tickFormat;
                tickFormat = x;
                return box;
            };

            box.duration = function (x) {
                if (!arguments.length) return duration;
                duration = x;
                return box;
            };

            box.showLabels = function (x) {
                if (!arguments.length) return showLabels;
                showLabels = x;
                return box;
            };

            return box;
        };
    },
    makeColorScale: function () {
    },

    initData: function () {
    },

    estimateSize: function () {
        var _this = this;

        var h = this.getHeight();
        h -= (this.plotmargin.top + this.plotmargin.bottom);


        var w = this.getWidth();
        w -= (this.plotmargin.right + this.plotmargin.left);

        this.pictureWidth = w;
        this.pictureHight = h;
    },

    plotUpdate: function () {
        this.plot();
    },


    _makePlot: function () {
    },

    plot: function () {
        var _this = this;
        this.estimateSize();

        console.log(this);

        this.chart
                .attr('class', 'd3box')
                .style('font', '10px Helvetica Neue');
        //.append("g")
        //        .attr("transform", "translate(" + this.plotmargin.left + "," + this.plotmargin.top + ")");


        var chart = d3.box()
                .height(this.pictureHight)
                .showLabels(this.showLabels);


        var min = Infinity, max = -Infinity;
        this.store.data.items.forEach(function (d) {
            if (d.data.min < min) min = d.data.min;
            if (d.data.max > max) max = d.data.max;
        });

        var x = d3.scale.ordinal()
                .domain(this.store.data.items.map(function (d) {
                            return d.data.id
                        }))
                .rangeRoundBands([this.plotmargin.left, this.pictureWidth + this.plotmargin.left], 0.6, 0.1);

        var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

        var y = d3.scale.linear()
                .domain([min, max])
                .range([this.pictureHight + this.plotmargin.top, this.plotmargin.top]);

        var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

        var svg = _this.chart;
        // draw the boxplots
        svg.selectAll("*").remove();
        svg.selectAll(".d3box")
                .data(this.store.data.items)
                .enter().append("g")
                .attr("transform", function (d) {
                          return "translate(" + x(d.data.id) + "," + 0 + ")";
                      })
                .call(chart.width(x.rangeBand()));
        svg.append("g")
                .attr("class", "x axis")
                .style("fill", "none")
                .style("stroke", "#000")
                .style("shape-rendering", "crispEdges")
                .style("font", "10px Helvetica Neue")
                .attr("transform", "translate(0," + (this.pictureHight + this.plotmargin.top + 5) + ")")
                .call(xAxis)
                .append("text")             // text label for the x axis
                .attr("x", (this.pictureWidth / 2))
                .attr("y", 25)
                .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Nucleotide position");

        // draw y axis
        svg.append("g")
                .attr("class", "y axis")
                .style("fill", "none")
                .style("stroke", "#000")
                .style("shape-rendering", "crispEdges")
                .style("font", "10px Helvetica Neue")
                .style("font-weight","none")
                .attr("transform", "translate(" + this.plotmargin.left + "," + 0 + ")")
                .call(yAxis);
        //.append("text") // and text1
        //.attr("y", -0)
        ////.attr("dy", ".71em")
        //.attr("x", -0)
        //.attr("transform", "rotate(-90)")
        //.style("text-anchor", "end")
        //.style("font-size", "16px")
        //.text("Quality");

        //	// add a title
        ////	svg.append("text")
        ////        .attr("x", (width / 2))
        ////        .attr("y", 0 + (margin.top / 2))
        ////        .attr("text-anchor", "middle")
        ////        .style("font-size", "18px")
        ////        //.style("text-decoration", "underline")
        ////        .text("Revenue 2012");


    }


});
