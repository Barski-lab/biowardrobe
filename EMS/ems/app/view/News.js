Ext.define('EMS.view.News', {
    extend: 'Ext.window.Window',
    alias: 'widget.news',

    autoShow: true,
    height: 300,
    width: 500,
    layout: {
        type: 'fit'
    },
    //iconCls: 'news',
    //title: 'Latest News',
    header: false,
    closeAction: 'hide',
    closable: false,
    resizable: true,
    border: false,
    frame: false,
    plain: false,
    x:10,
    y:10,
    items: [
        {
            xtype: 'panel',
            frame: false,
            border: false,
            autoScroll: true,
            autoLoad: {
                url: 'news.html'
            }
        }
    ]
});