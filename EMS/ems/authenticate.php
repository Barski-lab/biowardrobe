<?php
   include('/etc/settings/config.php');
   require_once('data/response.php');
   require_once('data/def_vars.php');
   if (!(isset($_REQUEST["username"]) && isset($_REQUEST["password"]) && $_REQUEST["username"]!='' && $_REQUEST["password"]!=''))
       $res->print_error('Not enough required parameters.');
   require_once('data/database_connection.php');

   $con=def_connect();
   $con->select_db($db_name_ems);


   $query_array=execSQL($con,"SELECT id,passwd,worker,lname,fname from worker where worker=? and passwd is not NULL",array("s",$_REQUEST["username"]),false);
   $con->close();

   session_start();
   if(!isset($_SESSION["attempt"])) {
       $_SESSION["attempt"]=0;
   }
   $_SESSION["attempt"]=intVal($_SESSION["attempt"])+1;

   if($_SESSION["attempt"]>6) {
       if(!isset($_SESSION["attempttime"])) $_SESSION["attempttime"]=time();
       $diff=time()-$_SESSION["attempttime"];
       if($diff < 300 ) {
        $res->print_error("You should wait ".intVal(((300-$diff)/60))." min, before next attempt");
       } else {
           $_SESSION["attempt"]=1;
       }
   }

   $_SESSION["changepass"]=0;
   if($_REQUEST["password"]==$query_array[0]['passwd']) {
        $_SESSION["changepass"]=1;
   } else {
       $salt = substr($query_array[0]['passwd'], 0, 64);
       $hash = $salt . $_REQUEST["password"];
       for ( $i = 0; $i < 100000; $i ++ ) {
           $hash = hash('sha256', $hash);
       }
       $hash = $salt . $hash;
       if ( $hash != $query_array[0]['passwd'] ) {
           $res->print_error("Incorrect user name or password");
       }
   }

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
