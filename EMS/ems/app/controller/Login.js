Ext.define('EMS.controller.Login', {
    extend: 'Ext.app.Controller',

    requires: [
        'EMS.util.MD5',
        'EMS.view.EMSViewport',
        'EMS.util.Util'
    ],

    views: [
        'Login'
        //        'authentication.CapsLockTooltip'
    ],

    //    refs: [
    //        {
    //            ref: 'capslockTooltip',
    //            selector: 'capslocktooltip'
    //        }
    //    ],

    init: function (application) {
        this.control({
                         "login form": {
                         },
                         "login form button#submit": {
                             click: this.onButtonClickSubmit
                         },
                         "login form button#cancel": {
                             click: this.onButtonClickCancel
                         },
                         "login form textfield": {
                             specialkey: this.onTextfielSpecialKey
                         },
                         "login form textfield[name=username]": {
                             keypress: this.onTextfielKeyPress,
                             render: this.onRender
                         },
                         "login form textfield[name=password]": {
                             keypress: this.onTextfielKeyPress
                         },
                         "viewport button#logout": {
                             click: this.onButtonClickLogout
                         }
                     });

        Ext.apply(Ext.form.field.VTypes, {
            //  vtype validation function
            customPass: function (val, field) {
                return /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})/.test(val);
            },
            // vtype Text property: The error text to display when the validation function returns false
            customPassText: 'Not a valid password.  Length must be at least 6 characters and maximum of 20Password must contain one digit, one letter lowercase, one letter uppercase, onse special symbol @#$% and between 6 and 20 characters.',
        });

    },
    onRender: function (f) {
        f.focus(false,5000,function(){console.log('focus');});
    },

    onButtonClickSubmit: function (button, e, options) {
        var formPanel = button.up('form'),
                login = button.up('login'),
                user = formPanel.down('textfield[name=username]').getValue(),
                pass = formPanel.down('textfield[name=password]').getValue();

        if (formPanel.getForm().isValid()) {

            Ext.get(login.getEl()).mask("Authenticating... Please wait...", 'loading');

            Ext.Ajax.request
            ({
                 url: 'authenticate.php',
                 jsonData: Ext.encode({
                                          "username": user,
                                          "password": pass //EMS.util.MD5.encode(pass);
                                      }),
                 method: 'POST',
                 success: function (conn, response, options, eOpts) {
                     Ext.get(login.getEl()).unmask();
                     var result = EMS.util.Util.decodeJSON(conn.responseText);
                     if (result.success) {
                         login.close();
                         Ext.create('EMS.view.EMSViewport');
                     } else {
                         EMS.util.Util.showErrorMsg(result.message);
                     }
                 },
                 failure: function (conn, response, options, eOpts) {
                     Ext.get(login.getEl()).unmask();
                     EMS.util.Util.showErrorMsg(EMS.util.Util.decodeJSON(conn.responseText).message);
                 }
             });
        }
    },

    onButtonClickCancel: function (button, e, options) {
        button.up('form').getForm().reset();
    },

    onTextfielSpecialKey: function (field, e, options) {
        if (e.getKey() == e.ENTER) {
            var submitBtn = field.up('form').down('button#submit');
            submitBtn.fireEvent('click', submitBtn, e, options);
        }
    },

    onTextfielKeyPress: function (field, e, options) {
        //        var charCode = e.getCharCode();
        //
        //        if ((e.shiftKey && charCode >= 97 && charCode <= 122) ||
        //            (!e.shiftKey && charCode >= 65 && charCode <= 90)) {
        //
        //            if (this.getCapslockTooltip() === undefined) {
        //                Ext.widget('capslocktooltip');
        //            }
        //
        //            this.getCapslockTooltip().show();
        //
        //        } else {
        //
        //            if (this.getCapslockTooltip() !== undefined) {
        //                this.getCapslockTooltip().hide();
        //            }
        //        }
    },

    onButtonClickLogout: function (button, e, options) {
        Ext.Ajax.request({
                             url: 'logout.php',
                             success: function (conn, response, options, eOpts) {
                                 var result = EMS.util.Util.decodeJSON(conn.responseText);

                                 if (result.success) {
                                     button.up('viewport').destroy();
                                     window.location.reload();
                                 } else {
                                     EMS.util.Util.showErrorMsg(result.message);
                                 }
                             },
                             failure: function (conn, response, options, eOpts) {
                                 EMS.util.Util.showErrorMsg(EMS.util.Util.decodeJSON(conn.responseText).message);
                             }
                         });
    }
});