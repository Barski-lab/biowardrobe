<?php

   require("common.php");
   require_once('response.php');
   require_once('def_vars.php');
   require_once('database_connection.php');

$data=json_decode($_REQUEST['data']);

if(!isset($data))
$res->print_error("no data");

logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
logmsg(print_r($data,true));


$count=1;



$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
print_r($res->to_json());

?>
