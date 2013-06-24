<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

check_val($tablename);

$con=def_connect();
$con->select_db($db_name_experiments);

if(execSQL($con,"describe `$tablename`",array(),true)==0) {
       $res->print_error("Cant describe");
}

if(! ($totalquery = $con->query("SELECT COUNT(*) FROM `$tablename`")) ) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$row=$totalquery->fetch_row();
$total=$row[0];
$totalquery->close();


$query_array=execSQL($con,"SELECT * FROM `$tablename`",array(),false,0);
$con->close();

$res->success = true;
$res->message = "Data loaded";
$res->total = sizeof($query_array);
$res->data = $query_array;
print_r($res->to_json());
?>

