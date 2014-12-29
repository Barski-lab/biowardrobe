Ext.define('EMS.view.Help', {
    extend: 'Ext.window.Window',
    alias: 'widget.about',

    autoShow: true,
    height: 500,
    width: 820,
    layout: {
        type: 'fit'
    },
    iconCls: 'help',
    title: 'Help',
    closeAction: 'hide',
    closable: true,
    resizable: true,
    frame: false,
            items: [
                {
                    frame: false,
                    xtype: 'uxiframe',
                    src: "https://genome-tools.googlecode.com/git/EMS/ems/doc/help.pdf",
                    origUrl: "https://genome-tools.googlecode.com/git/EMS/ems/doc/help.pdf"
                }
            ]
});