<?php

require_once('../auth.php');

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['resultid']))
    $resultid = $_REQUEST['resultid'];
else
    $res->print_error('Not enough required parameters.');

$con=def_connect();
$con->select_db($db_name_ems);

//logmsg(print_r($_REQUEST,true));

$query_array=execSQL($con,"SELECT tableName from result where id=?",array("i",$resultid),false);
//logmsg(print_r($query_array,true));
$tablename=$query_array[0]['tableName'];

if($tablename=="")
    $res->print_error('Cant find table');

if(execSQL($con,"describe `$db_name_experiments`.`$tablename`",array(),true)==0) {
    $res->print_error("Cant describe");
}


$query_array=execSQL($con,"SELECT V1 as name,PC1,PC2,PC3,groups as color from `$db_name_experiments`.`$tablename` where V1 <>'barplot'",array(),false);

$res->success = true;
$res->message = "Data loaded";
$res->total = sizeof($query_array);
$res->data = $query_array;
print_r($res->to_json());
?>

