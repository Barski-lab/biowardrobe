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
        },

        UUID: function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        }
    }
});