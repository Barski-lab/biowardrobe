Ext.define('EMS.view.user.Edit', {
    extend: 'Ext.window.Window',
    alias : 'widget.useredit',

    requires: ['Ext.form.Panel'],

    title : 'Edit User',
    layout: 'fit',
//    autoShow: true,
    height: 210,
    width: 280,

    initComponent: function() {
        this.items = [
            {
                xtype: 'form',
                padding: '5 5 0 5',
                border: false,
                style: 'background-color: #fff;',

                items: [
                    {
                        xtype: 'textfield',
                        name : 'Worker',
                        fieldLabel: 'Worker'
                    },
                    {
                        xtype: 'textfield',
                        name : 'fname',
                        fieldLabel: 'First name'
                    },
                    {
                        xtype: 'textfield',
                        name : 'lname',
                        fieldLabel: 'Last name'
                    }
                ]
            }
        ];

        this.buttons = [
            {
                text: 'Save',
                action: 'save'
            },
            {
                text: 'Cancel',
                scope: this,
                handler: this.close
            }
        ];

        this.callParent(arguments);
    }
});
