<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con=def_connect();
$con->select_db($db_name_ems);

//if(! ($totalquery = $con->query("SELECT COUNT(*) FROM `$tablename` $where")) ) {
//    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
//}
//$row=$totalquery->fetch_row();
//$total=$row[0];
//$totalquery->close();

//$query_array=execSQL($con,"SELECT * FROM `$tablename` $where $order $limit",array(),false);
//$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());

?>
