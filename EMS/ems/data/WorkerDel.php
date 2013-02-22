<?php
require('common.php');
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$con=def_connect();
$con->select_db($db_name_ems);
$tablename="worker";

$data=json_decode(stripslashes($_REQUEST['data']));
if(!isset($data))
    $res->print_error("no data");
if(intVal($data->id)==0)
    $res->print_error("no id");
if(!check_rights('worker'))
    $res->print_error("no rights");

$SQL_STR="delete from `$tablename` where id=?";

$PARAMS=array("i",$data->id);

if(execSQL($con,$SQL_STR,$PARAMS,true)==0) {
    $res->print_error("Cant delete");
} else {
    $res->success = true;
    $res->message = "Data has deleted";
    print_r($res->to_json());
    exit();
}

$res->success = false;
$res->message = "Data is not deleted";
print_r($res->to_json());

$con->close();
?>
