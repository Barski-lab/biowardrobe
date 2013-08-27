<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));

if(isset($_REQUEST['id']))
    $ID = $_REQUEST['id'];
else
    $res->print_error('Not enough required parameters.');

check_val($ID);

$con=def_connect();
$con->select_db($db_name_ems);

$query_array=execSQL($con,"SELECT * FROM `atdp` where genelist_id like ? order by tbl1_id, tbl2_id",array("s",$ID),false);
$con->close();

//logmsg(print_r($query_array,true));

$res->success = true;
$res->message = "Data loaded";
$res->total = sizeof($query_array);
$res->data = $query_array;
print_r($res->to_json());
?>

