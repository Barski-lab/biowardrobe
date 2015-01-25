Ext.define('EMS.view.Login', {
    extend: 'Ext.window.Window',
    alias: 'widget.login',

    autoShow: true,
    height: 150,
    width: 330,
    layout: {
        type: 'fit'
    },
    iconCls: 'key',
    title: 'Wardrobe login',
    closeAction: 'hide',
    closable: false,
    resizable: false,

    items: [
        {
            xtype: 'form',
            frame: false,
            bodyPadding: 15,

            autoEl: {
                tag: 'form',
                method: 'POST',
                action: 'news.html',
                target: 'submitTarget',
                style: {
                    margin: 0
                }
            },
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'textfield',
                anchor: '100%',
                labelWidth: 60,
                allowBlank: false,
                minLength: 3,
                msgTarget: 'side'
            },
            items: [
                {
                    fieldLabel: 'Username',
                    name: 'username',
                    vtype: 'alphanum',
                    tabIndex:0,
                    maxLength: 25,
                    'inputAttrTpl': [
                        'autocomplete="on"'
                    ]
                },
                {
                    inputType: 'password',
                    name: 'password',
                    fieldLabel: 'Password',
                    enableKeyEvents: true,
                    maxLength: 30,
                    msgTarget: 'side',
                    'inputAttrTpl': [
                        'autocomplete="on"'
                    ]
                },
                {
                    xtype: 'component',
                    html: '<iframe id="submitTarget" name="submitTarget" style="display:none"></iframe>'
                }, {
                    xtype: 'component',
                    html: '<input type="submit" id="submitButton" style="display:none" />'
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    layout: {
                        pack: 'center'
                    },

                    items: [
                        {
                            xtype: 'button',
                            itemId: 'cancel',
                            iconCls: 'cancel',
                            text: 'Cancel'
                        },
                        {
                            xtype: 'button',
                            itemId: 'submit',
                            formBind: true,
                            iconCls: 'key-go',
                            text: 'Login'
                        }
                    ]
                }
            ]
        }
    ]
});