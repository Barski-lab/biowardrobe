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

/**
 * @class Its.grid.column.Component
 * @extends Ext.grid.column.Column
 * @xtype itscomponentcolumn
 * @version 2.3
 * @author Nguyen Truong Sinh (vietits@yahoo.com)
 *
 * A column definition class which renders a component, or a series of components in a grid cell.
 *
 *     @example
 *     var store = Ext.create('Ext.data.Store', {
 *         fields:['taskname', 'status', 'assignTo', 'dep'],
 *         data:[
 *             {taskname:"Task 1", status:1, assignTo:"Scott", dep:"Manangement"},
 *             {taskname:"Task 2", status:2, assignTo:"John", dep:"Sales"},
 *             {taskname:"Task 3", status:2, assignTo:"Smith", dep:"Accounting"},
 *             {taskname:"Task 4", status:3, assignTo:"Smith", dep:"Accounting"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Component Column Demo',
 *         name : 'task',
 *         store: store,
 *         columns: [{
 *          .......
 *          },{ // a column with a combobox
 *              xtype: 'itscomponentcolumn',
 *              text : 'Status',
 *              width: 160,
 *              name : 'status',
 *              dataIndex: 'status',
 *              items: {
 *                  prepare: function(config, value) {
 *                      return {
 *                          xtype: 'combobox',
 *                          store: [[1,'In Queue'], [2,'Handling'], [3,'Complete']],
 *                          value: value
 *                      };
 *                  }
 *              }
 *          },{ // a column with two buttons to modify/delete task
 *              xtype: 'itscomponentcolumn',
 *              align: 'center',
 *              width: 50,
 *              name : 'action',
 *              defaults: { // default configs applied for all items
 *                  xtype: 'button',
 *                  width: 'auto'
 *              },
 *              items: [{
 *                  iconCls: 'icon-modify',
 *                  action : 'modify',
 *                  tooltip: 'Modify this task'
 *              },{
 *                  iconCls: 'icon-delete',
 *                  action : 'delete',
 *                  tooltip: 'Delete this task'
 *              }]
 *         }],
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 *
 * # Default settings
 *
 * - hideable: false
 * - groupable: false
 * - defaultType: 'component'
 *
 * # Child component events
 *
 * The following arguments will be added to the end of argument list of each event:
 *
 * - record The record providing the data.
 * - rowIndex The row index.
 * - colIndex The column index.
 * - store The store which provides model data
 * - view The grid view object.
 * - comp The component itself.
 *
 * @update 2012-01-14 22:37:21
 *  Release version 1.0
 *
 * @update 2012-01-24 08:37:09
 *  Release version 2.0 with the following updates:
 *  - Remove relayEvents, eventPrefix and prefixEvent from component config which can be replaced by bubbleEvents and bubblePrefix.
 *  - Add ownerCt to reflect component's owner container.
 *  - Add the ability that is an item config can be a function.
 *  - Fix the destroy() method.
 *
 * @update 2012-03-17 21:23:34
 *  Release version 2.1 with the following updates:
 *  - Append record and store to event arguments
 *  - Update internal code
 * @update 2012-04-23 19:48:46
 *  Release version 2.2 with the following updates:
 *  - Update internal code
 * @update 2012-05-05 09:58:07
 *  Release version 2.3 with the following updates:
 *  - Update internal code
 */


Ext.define('EMS.util.ComponentColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.componentcolumn',


    /**
     * @cfg {String/Function/Object/String[]/Function[]/Object[]} items
     * Child component configs. Items can be:
     * - an xtype (string) or array of xtype (string[])
     * - a function which returns item config object or an array of functions.
     *   Function will be called with following arguments:
     *   + value The value of the column's configured field (if any).
     *   + record The record providing the data.
     *   + rowIndex The row index.
     *   + colIndex The column index.
     *   + store The store which is providing the data Model.
     *   + view The current view.
     * - an object which represents item conig or an array of config objects
     * - mix of above types.
     *
     * Besides the normal component configs, each item may contain:
     *
     * @cfg {Function} items.prepare A function which returns the component config.
     * @cfg {Object} items.prepare.config The current config.
     * @cfg {Object} items.prepare.value The value of the column's configured field (if any).
     * @cfg {Ext.data.Model} items.prepare.record The record providing the data.
     * @cfg {Number} items.prepare.rowIndex The row index.
     * @cfg {Number} items.prepare.colIndex The column index.
     * @cfg {Ext.data.Store} items.prepare.store The store which is providing the data Model.
     * @cfg {Ext.grid.View} items.prepare.view The current view.
     *
     * @cfg {Object} items.scope The scope (`this` reference) in which the `prepare` function
     * is executed.
     */

    constructor: function (config) {
        var me = this;
        var cfg = Ext.apply({
                                hideable: false,
                                groupable: false,
                                defaultType: 'component'
                            }, config);
        var lst = cfg.items;
        var def = cfg.defaults;


        delete cfg.items;
        delete cfg.columns;
        delete cfg.defaults;

        me.callParent([cfg]);


        me.defaults = def;
        me.queue = {};
        me.comps = Ext.create('Ext.util.MixedCollection', false, me.getComponentId);
        me.itemsConfig = [];
        lst = Ext.isArray(lst) ? lst : [lst];
        Ext.Array.each(lst, function (itm) {
            if (Ext.isString(itm)) {
                itm = {xtype: itm};
            }
            if (Ext.isObject(itm) || Ext.isFunction(itm)) {
                me.itemsConfig.push(itm);
            }
        });


        me.renderer = function (value, meta, record, rowIdx, colIdx, store, view) {
            var ret = '';
            var src = me.renderer.caller;
            //            if (src.$owner && src.$owner.xtype == 'headercontainer') {
            if (src.$owner) {
                var iid = me.getIdPrefix(record);
                me.queue[iid] = {
                    view: view,
                    store: store,
                    value: value,
                    record: record,
                    rowIdx: rowIdx,
                    colIdx: colIdx
                };
                ret = (Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(cfg.scope || me, arguments) || '' : '')
                              + '<div id="' + iid + '">&#160;</div>';
            }
            return ret;
        };
    },
    onRender: function () {
        var me = this;
        var pnl = me.up('tablepanel');
        var view = pnl.getView();


        me.mon(view, 'refresh', me.injectItems, me);
        me.mon(view, 'itemadd', me.injectItems, me);
        me.mon(view, 'itemupdate', me.injectItems, me);
        me.callParent(arguments);
    },
    getIdPrefix: function (record) {
        return Ext.String.format('{0}-{1}', this.getId(), record.internalId);
    },
    injectItems: function () {
        var me = this;
        var queue = me.queue;
        var items = me.itemsConfig;
        var cfLen = items.length;


        me.queue = {};
        for (var iid in queue) {
            var itm = queue[iid];
            var elm = Ext.get(iid);
            if (elm) {
                for (var idx = 0; idx < cfLen; idx++) {
                    var cfg = Ext.clone(items[idx]) || {};


                    if (Ext.isFunction(cfg)) {
                        cfg = cfg(itm.value, itm.record, itm.rowIdx, itm.colIdx, itm.store, itm.view);
                    }
                    if (Ext.isFunction(cfg.prepare)) {
                        cfg = cfg.prepare.call(cfg.scope || cfg, cfg, itm.value, itm.record, itm.rowIdx, itm.colIdx, itm.store, itm.view);
                    }
                    delete cfg.prepare;
                    cfg = me.applyDefaults(cfg);


                    cfg.itemId = iid + '-' + idx;


                    me.removeItem(cfg.itemId);

                    var cmp = me.lookupComponent(cfg);
                    if (cmp && cmp.isComponent) {
                        cmp.fireEvent = Ext.bind(cmp.fireEvent, cmp, [itm.record, itm.rowIdx, itm.colIdx, itm.store, itm.view, cmp], true);
                        cmp.render(elm.parent(), elm);
                        cmp.setupProtoEl();
                        if (Ext.isIE6) {
                            elm.parent().repaint();
                        }
                        cmp.ownerCt = me;
                        me.comps.add(cmp);
                    }
                }
                elm.remove();
            }
        }
    },
    onItemRemove: function (record) {
        var me = this;
        var iid = me.getIdPrefix(record);
        var idx = 0;


        while (me.removeItem(iid + '-' + idx)) {
            idx++;
        }
    },
    removeItem: function (cmp) {
        var me = this;
        var ret = false;


        if (Ext.isString(cmp)) {
            cmp = me.comps.getByKey(cmp);
        }
        if (cmp) {
            cmp.ownerCt = null;
            me.comps.remove(cmp);
            cmp.destroy();
            ret = true;
        }
        return ret;
    },
    $callParent: function (args) {
        var me = this;
        var ret = null;
        var method = me.$callParent.caller,
                parentClass, methodName;


        if (!method.$owner) {
            method = method.caller;
        }
        parentClass = method.$owner.superclass;
        methodName = method.$name;


        if (me.items === me.comps) {
            ret = parentClass[methodName].apply(me, args || []);
        } else {
            var items = me.items;
            me.items = me.comps;
            ret = parentClass[methodName].apply(me, args || []);
            me.items = items;
        }
        return ret;
    },
    beforeDestroy: function () {
        var me = this;


        me.$callParent(arguments);
        Ext.destroyMembers(me, 'comps', 'queue', 'renderer');
    },
    doRemove: function (cmp) {
        this.$callParent(arguments)
    },
    removeAll: function () {
        return this.$callParent(arguments);
    },
    getComponent: function () {
        return this.$callParent(arguments);
    },
    getRefItems: function () {
        return this.$callParent(arguments);
    },
    cascade: false
});