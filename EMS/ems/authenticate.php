<?php
   include('/etc/settings/config.php');
   require_once('data/response.php');
   require_once('data/def_vars.php');
   if (!(isset($_REQUEST["username"]) && isset($_REQUEST["password"])))
       $res->print_error('Not enough required parameters.');
   require_once('data/database_connection.php');

   $con->select_db($db_name_ems);

   if(! ($worker = $con->prepare("SELECT id,worker,lname,fname from worker where worker=? and passwd=?")) ) {
       $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
   }

   if(! $worker->bind_param("ss",$_REQUEST["username"],$_REQUEST["password"]) ) {
       $res->print_error("Bind failed: (" . $con->errno . ") " . $con->error);
   }

   if(! $worker->execute() ) {
       $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
   }

   $worker->bind_result($ID,$WORKER,$LNAME,$FNAME);
   $worker->fetch();
   $worker->close();
   $con->close();

   if(!(isset($ID) && isset($WORKER)) ) {
       $res->print_error("Incorrect user name or password");
       exit();
   }

   session_start();

   $_SESSION["username"] = $WORKER;
   $_SESSION["usergroup"] = $WORKER;
   $_SESSION["fullname"] = $LNAME.", ".$FNAME;
   $_SESSION["user_id"] = $ID;
   $_SESSION["timeout"] = time();

   $res->success = true;
   $res->message = "auth";
   print_r($res->to_json());

   exit();
?>
