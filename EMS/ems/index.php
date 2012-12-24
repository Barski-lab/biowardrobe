<?php
  require("common.php");
  require_authentication();
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
 var USER_NAME="<?php echo $_SESSION[username] ?>";
</script>
 <script type="text/javascript" src="app.js"></script>
</head>

<body></body>
</html>
