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

Ext.define("EMS.ux.d3", {
    extend: 'Ext.Component',
    //    alias: ['widget.d3'],

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
    loadMaskMsg: 'Processing ... ',

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
    storeLoaded: false,

    plot: function () {
    },

    constructor: function (config) {
        config.listeners && (this.afterChartRendered = config.listeners.afterChartRendered);
        //this.afterChartRendered && (this.afterChartRendered = Ext.bind(this.afterChartRendered, this));
        this.callParent(arguments);
        Ext.apply(this, config);
    },

    initComponent: function () {
        this.store && (this.bindStore(this.store, true));
        if (this.loadMask !== false) {
            if (this.loadMask === true) {
                this.loadMask = new Ext.LoadMask({target: this, msg: this.loadMaskMsg});
            }
        }
        this.callParent(arguments);
    },

    afterRender: function () {
        this.bindComponent(true);
        this.update();
        this.callParent(arguments);
    },

    update: function () {
        var _this = this;

        if (this.loadMask !== false && this.rendered && !this.loadMask.isVisible()) {
            this.loadMask.show();
        }

        var cdelay = 2;
        if (!_this.updateTask) {
            _this.updateTask = new Ext.util.DelayedTask(_this.draw, _this);
        }
        _this.updateTask.delay(cdelay);
    },

    draw: function () {
        var _this = this;

        if ((this.store && !this.store.lastOptions) || !_this.rendered) {
            return;
        }


        if (this.loadMask !== false && this.rendered && !this.loadMask.isVisible()) {
            this.loadMask.show();
        }


        if (_this.chart && _this.rendered) {
            console.log("drop chart");
            d3.select(this.el.dom).remove();
        }

        this.d3Canvas();
        try {
            this.plot();
        } catch (err) {
            console.log(err);
        }

        if (this.loadMask !== false) {
            this.loadMask.hide();
        }
    },

    save: function () {
        var svgstr;
        var _this = this;
        if (!this.chart) return "";
        if (typeof XMLSerializer != "undefined") {
            svgstr = (new XMLSerializer()).serializeToString(this.chart[0][0]);
        } else {
            svgstr = $(this.chart).html();
        }
        return svgstr;
    },

    d3Canvas: function () {
        this.chart = d3.select(this.el.dom)
                .append("svg")
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr("width", this.getWidth())
                .attr("height", this.getHeight())
                .style('position', 'absolute')
                .style('top', 0)
                .style('left', 0);
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
                this.store.un("remove", this.onRemove, this);
                this.store.un("update", this.onUpdate, this);
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
                         remove: this.onRemove,
                         update: this.onUpdate,
                         //                         clear: this.onClear
                     });
        }

        this.store = store;
    },

    destroy: function () {
        var _this = this;
        if (this.chart) {
            d3.select(this.el.dom).remove();
            delete this.chart;
        }
        this.bindComponent(null);
        this.bindStore(null);
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
        var _this = this;
        this.storeLoaded = true;
        this.update();
    },

    onRemove: function () {
        console.log("d3 on remove");
        this.storeLoaded = false;
    },
    onUpdate: function () {
        console.log("d3 on update");
        this.storeLoaded = false;
    },

});
