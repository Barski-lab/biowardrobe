<?php

  $TITLE="EMS login";

  if($_REQUEST["timeout"]=="true")
  {
   $TITLE="session timeouts";
  }

  session_destroy();
  session_start();
?>
<html>
  <head>
     <title>Login</title>
      <link rel="stylesheet" type="text/css" href="ext/resources/css/ext-all.css">
      <link rel="stylesheet" type="text/css" href="ext/examples/desktop/css/desktop.css"/>
      <script type="text/javascript" src="ext/ext-debug.js"></script>

        <style type="text/css">
            body {
                font: normal 12px arial, tahoma, verdana, sans-serif;
                color: #444;
                background: #f0f0f0;
            }

            #login-box {
                width: 380px;
                margin-top: 80px;
                text-align: left;
            }
        </style>

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
        var loginForm=new Ext.form.Panel({
            bodyPadding: 5,
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
        }, {
          xtype: 'textfield',
          id: 'password',
          fieldLabel: 'Password',
          name: 'password',
          width: 'fit',
          allowBlank: false,
          inputType: 'password'
       }],

           buttons: [{
             text: 'Login',
             handler: function(){
               if(Ext.getCmp('username').getValue() !== '' && Ext.getCmp('password').getValue() !== '')
               {
                 loginForm.getForm().submit({
                   url: 'authenticate.php',
                   method: 'POST',
                   success: function(){
                     window.location = 'index.php';
                   },
                   failure: function(form, action){
                     Ext.Msg.show({
                       title: 'Error',
                       msg: action.result.message,
                       icon: Ext.Msg.ERROR,
                       buttons: Ext.Msg.OK
                       });
                   }
                 });
               }else{
                 Ext.Msg.show({
                   title: 'Error',
                   msg: 'Please enter user name and password',
                   icon: Ext.Msg.ERROR,
                   buttons: Ext.Msg.OK
                 });
               }
             }
           },{
           text: 'Cancel',
           handler: function() {
               this.up('form').getForm().reset();
           }}]

        });
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
        loginWindow.show();
    });
     </script>

   </head>

   <body>
   <center>
    <div id="login-box" class="x-panel">
       <form id="form" action="authenticate.php" method="POST">
           <input id="username" type="text" name="username" class="x-hidden">
           <input id="password" type="password" name="password" class="x-hidden">
           <input id="submit" type="submit" class="x-hidden">
       </form>
    </div>
    </center>
   </body>
</html>
