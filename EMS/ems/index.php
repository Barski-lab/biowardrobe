<?php
  require("common.php");
?>

<html>
<head>
 <title>Laboratory examples</title>

 <link rel="stylesheet" type="text/css" href="ext/resources/css/ext-all.css">
 <link rel="stylesheet" type="text/css" href="app.css">
 <!--link rel="stylesheet" type="text/css" href="ext/examples/shared/example.css"/-->
 <link rel="stylesheet" type="text/css" href="ext/examples/desktop/css/desktop.css"/>


 <script type="text/javascript" src="ext/ext-debug.js"></script>


 <script type="text/javascript">
  var USER_NAME="<?php echo $_SESSION["fullname"] ?>";
  var USER_ID="<?php echo $_SESSION["user_id"] ?>";
  var USER_LNAME="<?php echo $_SESSION["username"] ?>";
  var USER_GNAME="<?php echo $_SESSION["usergroup"] ?>";
 </script>
 <script type="text/javascript" src="store_defs.js"></script>
 <script type="text/javascript" src="app.js"></script>
</head>

<body>
</body>
</html>
