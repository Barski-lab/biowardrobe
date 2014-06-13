Ext.define('EMS.util.Util', {

    statics: {

        required: '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',

        decodeJSON: function (text) {
            var result = Ext.JSON.decode(text, true);
            //console.log("decodeJSON=", result);

            if (!result) {
                result = {};
                result.success = false;
                result.message = text;
            }

            return result;
        },

        showErrorMsg: function (text) {
            Ext.Msg.show({
                             title: 'Error!',
                             msg: text,
                             icon: Ext.Msg.ERROR,
                             buttons: Ext.Msg.OK
                         });
            this.Logger.log(text);
        },
        UUID: function() {
            var d = new Date().getTime();
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            var uuid = 'lxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[lxy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (c=== 'l')?possible.charAt(Math.floor(Math.random() * possible.length)):(r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        },
        UUID_OLD: function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        },
        Settings: function(key) {
            return Ext.getStore('Preferences').findRecord('key',key,0,false,true,true).data['value'];
        },
        Logger: {
            panel: {},

            log: function (msg, color) {
                color = typeof color !== 'undefined' ? color : "blue";
                if (typeof this.panel !== 'undefined') {
                    this.panel.update({
                                          now: new Date(),
                                          cls: color,
                                          msg: msg
                                      });
                    this.panel.body.scroll('b', 100000, true);
                }
                console.log(msg);
            },

            init: function (logv) {
                this.panel = logv;
                this.log('Logging is on');
            }
        }
    }
});