<?php

require_once('../auth.php');

   require('common.php');
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con=def_connect();
$con->select_db($db_name_ems);


$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
logmsg(print_r($data,true));

$con->autocommit(FALSE);
if(gettype($data)=="array")
    $res->print_error("Arrays are not accepted");

execSQL($con,"delete from resultintersection where rhead_id in (select id from rhead where project_id=?)",array("i",intVal($data->id)),true);
execSQL($con,"delete from analysis where rhead_id in(select id from rhead where project_id=?)",array("i",intVal($data->id)),true);

execSQL($con,"delete from rhead where project_id=?",array("i",intVal($data->id)),true);

$result=execSQL($con,"SELECT tableName FROM result WHERE labdata_id is NULL and project_id=?",array("i",$data->id),false);
if($result != 0 )
    foreach($result as $a => $b ) {
        $con->query("DROP TABLE IF EXISTS `$db_name_experiments`.`".$b["tableName"]."`");
    }

execSQL($con,"delete from result where project_id=?",array("i",intVal($data->id)),true);
execSQL($con,"delete from ahead where project_id=?",array("i",intVal($data->id)),true);
execSQL($con,"delete from project where id=?",array("i",intVal($data->id)),true);

if(!$con->commit())
    $res->print_error("Cant delete");


$res->success = true;
$res->message = "Data has been deleted";
print_r($res->to_json());

$con->close();
?>
