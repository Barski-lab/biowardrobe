Ext.define('EMS.view.About', {
    extend: 'Ext.window.Window',
    alias: 'widget.about',

    autoShow: true,
    height: 330,
    width: 410,
    layout: {
        type: 'fit'
    },
    iconCls: 'about',
    title: 'About Wardrobe',
    closeAction: 'hide',
    closable: true,
    resizable: false,
    frame: false,
    items: [
        {
            xtype: 'form',
            frame: false,
            bodyPadding: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'label',
                    frame: false,
                    border: false,
                    html: '<img src="images/wardrobe_about.png" width=100% height=156><div class="news-text">' +
                          'Wardrobe version <b>1.0.0</b>, build <b>#635</b> December 28, 2014<br>' +
                          'Has been delivered by Andrey Kartashov email: <a href="mailto:porter@porter.st">porter@porter.st</a><br>' +
                          'Powered by:</div>'+
'&nbsp;<a href="http://qt.io/" target="_blank"><img src="images/Qt_logo.png" width=48 height=48></a>&nbsp;' +
                          '<a href="http://php.net/" target="_blank"><img src="images/php_logo.png" width=48 height=48></a>' +
'<a href="http://extjs.com/" target="_blank"><img src="images/sencha_logo.png" width=48 height=56></a>&nbsp;' +
                          '<a href="http://d3js.org/" target="_blank"><img src="images/d3js.svg" width=48 height=48></a>&nbsp;&nbsp;' +
                          '<a href="http://opensuse.org/" target="_blank"><img src="images/opensuse_logo.png" width=48 height=48></a>&nbsp;&nbsp;' +
                          '<a href="http://apache.org/" target="_blank"><img src="images/apache_logo.gif" width=56 height=48></a>&nbsp;&nbsp;' +
                          '<a href="http://python.org/" target="_blank"><img src="images/python_logo.svg" width=48 height=48></a>&nbsp;&nbsp;' +
                          ''
                }
            ]
        }
    ]
});