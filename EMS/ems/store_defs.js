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


var Logger = (function(){
    var panel;
    var queue;

    return {
        log: function(msg, color){
            color = typeof color !== 'undefined' ? color : "blue";
            if(typeof panel !== 'undefined')
            {
                panel.update({
                                 now: new Date(),
                                 cls: color,
                                 msg: msg
                             });
                panel.body.scroll('b', 100000, true);
                console.log(msg);
            }
            else
            {
                console.log(msg);
            }
        },
        init: function(logv){
            panel = logv;
            //            panel.update({
            //                             now: new Date(),
            //                             cls: 'blue',
            //                             msg: 'Logging is on'
            //                         });
            panel.body.scroll('b', 100000, true);
        }
    };
})();


STORE_DEFS = {
    //default parameters for store proxy
    proxy: function(TBL,UNL){
        var prx= {
            type: 'ajax',
            timeout: 600000,
            api: {
                read : 'data/GeneralList.php',
                update: 'data/GeneralListUp.php',
                create: 'data/GeneralListAdd.php',
                destroy: 'data/GeneralListDel.php'
            },
            extraParams: {
                tablename:  TBL
            },
            reader: {
                type: 'json',
                root: 'data',
                successProperty: 'success'
            },
            writer: {
                type: 'json',
                root: 'data',
                writeAllFields: true,
                encode: true
            },
            listeners: {
                exception: function(proxy, response, operation) {
                    //Logger.log(proxy, response, operation);
                    try {
                        var json = Ext.decode(response.responseText);
                        if (json) {
                            //                            Ext.MessageBox.show({
                            //                                                    title: operation.action+' failed',
                            //                                                    msg: json.message,
                            //                                                    icon: Ext.MessageBox.ERROR,
                            //                                                    buttons: Ext.Msg.OK
                            //                                                });
                            Logger.log(operation+' failed:'+json.message);
                            console.log(operation+' failed:',json.message,' data:',json.data);
                        } else {
                            Ext.MessageBox.show({
                                                    title: operation.action+' failed',
                                                    msg: operation.getError(),
                                                    icon: Ext.MessageBox.ERROR,
                                                    buttons: Ext.Msg.OK
                                                 });
                        }
                    }
                    catch(Error)
                    {
                        Ext.Msg.show({
                                         title: operation.action+' failed',
                                         msg: 'Error in "'+operation.action+'" operation',
                                         icon: Ext.Msg.ERROR,
                                         buttons: Ext.Msg.OK
                                     });
                    }
                }
            } //listeners
        }//return
        if(UNL) {
            prx.filterParam = undefined;
            prx.groupParam= undefined;
            prx.pageParam=undefined;
            prx.startParam=undefined;
            //            prx.sortParam=undefined;
            prx.limitParam=undefined;
        }
        return prx;
    }//proxy function


}
