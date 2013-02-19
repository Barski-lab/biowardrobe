<?php
require('common.php');
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['worker_id']))
    $worker_id = $_REQUEST['worker_id'];
else
    $worker_id=0;

$con=def_connect();
$con->select_db($db_name_ems);

$tablename="worker";

if($worker_id==0) {
    $SQL_STR="SELECT id,worker,fname,lname,dnalogin,dnapass,email,notify FROM `$tablename`";
    $PARAMS=array();
} else {
    $SQL_STR="SELECT id,worker,fname,lname,dnalogin,dnapass,email,notify FROM `$tablename` where worker_id=?";
    $PARAMS=array("i",$worker_id);
}

$query_array=execSQL($con,$SQL_STR,$PARAMS,false);

$con->close();

$res->success = true;
$res->message = "Data loaded";
$res->total = count($query_array);
$res->data = $query_array;
print_r($res->to_json());
?>
