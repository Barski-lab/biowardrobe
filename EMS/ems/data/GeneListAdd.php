<?php

   require("common.php");
   require_once('response.php');
   require_once('def_vars.php');
   require_once('database_connection.php');


logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));

//$data=json_decode($_REQUEST['data']);

//if(!isset($data))
//$res->print_error("no data");
//logmsg(print_r($data,true));



$count=1;

//if(gettype($data)=="array") {
//$res->print_error("Not supported yet.");
//}



$con=def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

if(!$con->commit()) {
    $res->print_error("Cant commit");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
//$res->data = $query_array;
print_r($res->to_json());

?>
