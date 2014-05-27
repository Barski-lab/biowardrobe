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
                    maxLength: 25
                },
                {
                    inputType: 'password',
                    name: 'password',
                    fieldLabel: 'Password',
                    enableKeyEvents: true,
                    maxLength: 30,
                    msgTarget: 'side'
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