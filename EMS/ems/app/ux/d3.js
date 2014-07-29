Ext.define("EMS.ux.d3", {
    extend: 'Ext.Component',
    alias: ['widget.d3'],

    /***
     * This method is called by other routines within this extension to output debugging log.
     * This method can be overrided with Ext.emptyFn for product deployment
     * @param {String} msg debug message to the console
     */
    log: function (msg) {
        (typeof console !== 'undefined' && this.debug) && console.log(msg);
    },

    /**
     * @cfg {Boolean} resizable
     * True to allow resizing, false to disable resizing (defaults to true).
     */
    resizable: false,

    /**
     * @cfg {Object} loadMask An {@link Ext.LoadMask} config or true to mask the
     * chart while
     * loading. Defaults to false.
     */
    loadMask: true,

    /***
     * @cfg {String} loadMaskMsg Message display for loadmask
     */
    loadMaskMsg: 'Loading ... ',

    /**
     * @cfg {Boolean} refreshOnChange
     * chart refresh data when store datachanged event is triggered,
     * i.e. records are added, removed, or updated.
     * If your application is just purely showing data from store load,
     * then you don't need this.
     */
    refreshOnChange: false,
    refreshOnLoad: false,

    afterChartRendered: null,

    //height of each row in the heatmap
    heatHeight: 0.03,
    //width of each column in the heatmap
    heatWidth: 5,

    rowsName: null,
    colsName: null,

    constructor: function (config) {
        config.listeners && (this.afterChartRendered = config.listeners.afterChartRendered);
        this.afterChartRendered && (this.afterChartRendered = Ext.bind(this.afterChartRendered, this));
        this.callParent(arguments);
        this.on('show', this.afterRender);
        Ext.apply(this, config);
    },

    initComponent: function () {
        this.store && (this.store = Ext.data.StoreManager.lookup(this.store));
        this.callParent(arguments);
        if (this.loadMask !== false) {
            if (this.loadMask === true) {
                this.loadMask = new Ext.LoadMask({target: this});
            }
        }
    },

    afterRender: function () {
        this.store && (this.bindStore(this.store, true));
        this.bindComponent(true);

        this.update();
    },

    update: function () {
        var _this = this;

        if (this.loadMask !== false) {
            this.loadMask.show();
        }

        if (_this.store && _this.store.isLoading()) return;

        this.rowsName = this.store.getAt(0).get('rows');
        this.colsName = this.store.getAt(0).get('cols');
        this.max = this.store.getAt(0).get('max');
        this.dataArray = this.store.getAt(0).get('array');

        var cdelay = 0;
        if (!_this.updateTask) {
            _this.updateTask = new Ext.util.DelayedTask(_this.draw, _this);
        }
        _this.updateTask.delay(cdelay);
    },

    draw: function () {
        // Sencha Touch uses config to access properties
        var _this = this;
        console.log("call draw");

        if (!_this.store || _this.store.isLoading()) {
            console.log("Store still loading");
            return;
        }

        console.log(this);

        if (_this.chart && _this.rendered) {
            //_this.chart.destroy();
            //delete this.chart;
            //this.chart = new Highcharts.Chart(_this.chartConfig, this.afterChartRendered);
            console.log("drop chart");
        } else if (_this.rendered) {
            //this.chart = new Highcharts.Chart(_this.chartConfig, this.afterChartRendered);
            console.log("creating chart from fresh");
        }
        this.d3Canvas();
        //generate the heatmap

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
                .attr('x', function (d) {
                          return (d[2] * _this.heatWidth) + 25;
                      })
                .attr('y', function (d) {
                          return (d[1] * _this.heatHeight) + 50;
                      })
                .style('fill', function (d) {
                           return _this.colorScale(d[0]);
                       });

        if (this.loadMask !== false) {
            this.loadMask.hide();
        }
        console.log((new XMLSerializer()).serializeToString(this.chart));
    },

    d3Canvas: function () {
        this.chart = d3.select(this.el.dom)
                .append("svg")
                .attr("width", (this.heatWidth * this.colsName.length) + 400)
                .attr("height", (this.heatHeight * this.rowsName.length + 100))
                .style('position', 'absolute')
                .style('top', 0)
                .style('left', 0);
        this.colorScale = d3.scale.linear()
                .domain([0, this.max])
                .range(["white", "blue"]);

    },

    onMove: function () {

    },

    bindStore: function (store, initial) {

        if (!initial && this.store) {
            if (store !== this.store && this.store.autoDestroy) {
                this.store.destroy();
            } else {
                //                this.store.un("datachanged", this.onDataChange, this);
                this.store.un("load", this.onLoad, this);
                //                this.store.un("add", this.onAdd, this);
                //                this.store.un("remove", this.onRemove, this);
                //                this.store.un("update", this.onUpdate, this);
                //                this.store.un("clear", this.onClear, this);
            }
        }
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            store.on({
                         scope: this,
                         load: this.onLoad,
                         //                         datachanged: this.onDataChange,
                         //                         add: this.onAdd,
                         //                         remove: this.onRemove,
                         //                         update: this.onUpdate,
                         //                         clear: this.onClear
                     });
        }

        this.store = store;
    },

    destroy: function () {
        var _this = this;

        if (this.chart) {
            this.chart.destroy();
            delete this.chart;
        }

        this.callParent(arguments);
    },

    bindComponent: function (bind) {
        if (bind) {
            //            this.on('move', this.onMove);
            this.on('resize', this._onResize);
        } else {
            //            this.un('move', this.onMove);
            this.un('resize', this._onResize);
        }
    },

    _onResize: function () {
        if (this.resizable) {
            console.log("call _onResize");
            //            this.draw();
        }
    },

    onLoad: function () {
        // Sencha Touch uses config to access properties
        var _this = this;
        this.update();
    },


});
