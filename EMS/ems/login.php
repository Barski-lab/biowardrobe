<?php
include('/etc/settings/config.php');

session_start();

if(isset($_SESSION["timeout"])) {
    unset($_SESSION["timeout"]);
    $_SESSION = array();
    //session_destroy();
    //session_unset();
}


$TITLE="EMS login";
$TIMEOUT="";

if(isset($_REQUEST["timeout"]) && $_REQUEST["timeout"]=="true") {
    $TITLE="session expired";
    $TIMEOUT="true";
}

?>
<html>
  <head>
     <title>Login</title>
      <link rel="stylesheet" type="text/css" href="ext/resources/css/ext-all.css">
      <link rel="stylesheet" type="text/css" href="ext/examples/desktop/css/desktop.css"/>
      <link rel="stylesheet" type="text/css" href="app.css">
   </head>

   <body>
   <center>
    <div id="loading-mask"></div> <div id="loading">
    <div class="loading-indicator">
        Loading...
    </div></div>


<script type="text/javascript" src="ext/ext-all.js"></script>
<script type="text/javascript">

Ext.require([
    'Ext.Msg.*',
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
]);


Ext.onReady(function() {

    setTimeout(function(){
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({remove:true});
    }, 250);

    if( Ext.isIE) {
        Ext.Msg.show({
                         title: 'Your browser is not supported',
                         msg: 'Please use Google Chrome or Safari',
                         icon: Ext.Msg.ERROR,
                         buttons: Ext.Msg.OK
                     });
        return;
    }

    var loginForm=new Ext.form.Panel({
                                         bodyPadding: 10,
                                         width: 300,
                                         height: 100,
                                         frame: true,
                                         autoEl: {
                                             tag: 'form',
                                             action: 'authenticate.php',
                                             method: 'post'
                                         },
                                         items: [{
                                                 xtype: 'textfield',
                                                 id: 'username',
                                                 fieldLabel: 'Username',
                                                 name: 'username',
                                                 width: 'fit',
                                                 allowBlank: false,
                                                 autoCreate: {
                                                     tag: "input",
                                                     type: "text",
                                                     autocomplete: "on"
                                                 }
                                             } , {
                                                 xtype: 'textfield',
                                                 id: 'password',
                                                 fieldLabel: 'Password',
                                                 name: 'password',
                                                 width: 'fit',
                                                 allowBlank: false,
                                                 inputType: 'password',
                                                 enableKeyEvents: true,
                                                 listeners: {
                                                     specialkey: submitOnEnter
                                                 }
                                             }],

                                         buttons: [{
                                                 text: 'Login',
                                                 id: 'login',
                                                 submitValue: false,
                                                 handler: function(){
                                                     submitForm();
                                                 }
                                             } , {
                                                 text: 'Cancel',
                                                 handler: function() {
                                                     this.up('form').getForm().reset();
                                                 }
                                             }]

                                     });

    function submitOnEnter(field, event) {
        if (field.name==='password' && event.getKey() === event.ENTER) {
            submitForm();
        }
    }

    function disableFields(dis) {
        if(dis) {
            Ext.getCmp('username').setReadOnly(true);
            Ext.getCmp('password').setReadOnly(true);
            Ext.getCmp('login').disable();
        }
        else {
            Ext.getCmp('username').setReadOnly(false);
            Ext.getCmp('password').setReadOnly(false);
            Ext.getCmp('login').enable();
        }
    }

    function submitForm() {
        disableFields(true);

        if(Ext.getCmp('username').getValue() !== '' && Ext.getCmp('password').getValue() !== '')
        {
            loginForm.getForm().submit({
                                           url: 'authenticate.php',
                                           method: 'POST',
                                           success: function(){
                                               window.location = 'index.php';
                                           },
                                           failure: function(form, action){
                                               disableFields(false);
                                               Ext.Msg.show({
                                                                title: 'Error',
                                                                msg: action.result.message,
                                                                icon: Ext.Msg.ERROR,
                                                                buttons: Ext.Msg.OK
                                                            });
                                           }
                                       });
        }else{
            disableFields(false);
            Ext.Msg.show({
                             title: 'Error',
                             msg: 'Please enter user name and password',
                             icon: Ext.Msg.ERROR,
                             buttons: Ext.Msg.OK
                         });
        }
    }

    var loginWindow = new Ext.Window({
                                         title: '<?php echo $TITLE; ?>',
                                         bodyPadding: 2,
                                         layout: 'fit',
                                         closable: false,
                                         resizable: false,
                                         draggable: true,
                                         border: false,
                                         height: 130,
                                         width: 300,
                                         items: [loginForm]
                                     });

    if('<?php echo $TIMEOUT;?>' === 'true') {
        Ext.Msg.show({
                         title: 'Your session has expired',
                         msg: 'Your session has expired, please login.',
                         icon: Ext.Msg.INFO,
                         buttons: Ext.Msg.OK,
                         fn:function(btn, text){
                             loginWindow.show();
                             loginForm.getForm().findField('username').focus(false,20);
                         }
                     });
    } else {
        loginWindow.show();
        loginForm.getForm().findField('username').focus(false,20);
    }

});
      </script>


   </body>
</html>
