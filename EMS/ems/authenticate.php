<?php
   include('/etc/settings/config.php');
   require_once('data/response.php');
   require_once('data/def_vars.php');
   if (!(isset($_REQUEST["username"]) && isset($_REQUEST["password"])))
       $res->print_error('Not enough required parameters.');
   require_once('data/database_connection.php');

   $con=def_connect();
   $con->select_db($db_name_ems);


   $query_array=execSQL($con,"SELECT id,worker,lname,fname from worker where worker=? and passwd=?",array("ss",$_REQUEST["username"],$_REQUEST["password"]),false);
   $con->close();

   if( $query_array[0]['id']=='' || $query_array[0]['worker']=='' ) {
       $res->print_error("Incorrect user name or password");
   }


   session_start();

   $_SESSION["username"] = $query_array[0]['worker'];
   $_SESSION["usergroup"] = $query_array[0]['worker'];
   $_SESSION["fullname"] = $query_array[0]['lname'].", ".$query_array[0]['fname'];
   $_SESSION["user_id"] = $query_array[0]['id'];
   $_SESSION["timeout"] = time();

   $res->success = true;
   $res->message = "auth";
   print_r($res->to_json());

   exit();
?>
