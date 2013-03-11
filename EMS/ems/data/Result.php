<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con=def_connect();
$con->select_db($db_name_ems);

//logmsg('request');
//logmsg(print_r($_REQUEST,true));

if(!isset($_REQUEST['projectid']) || intVal($_REQUEST['projectid'])==0)
    $res->print_error("Not enough arguments.");

$prjid=intVal($_REQUEST['projectid']);

if($where != "")
    $where=$where." and project_id=$prjid and labdata_id is NULL ";
else
    $where=" where project_id=$prjid and labdata_id is NULL ";

$con=def_connect();
$con->select_db($db_name_ems);


if(! ($totalquery = $con->query("SELECT COUNT(*) FROM result $where")) ) {
$res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$row=$totalquery->fetch_row();
$total=$row[0];
$totalquery->close();

$query_array=execSQL($con,"SELECT * FROM result $where $order $limit",array(),false);
$con->close();

$res->success = true;
$res->message = "Data loaded";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());

?>
