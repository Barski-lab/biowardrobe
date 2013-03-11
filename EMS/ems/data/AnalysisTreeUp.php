<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

logmsg("Up");
logmsg(print_r($data,true));



$con=def_connect();
$con->select_db($db_name_ems);

$count=1;

$con->autocommit(FALSE);

if(gettype($data)=="array") {

    foreach($data as $key => $val ) {
        execSQL($con,
                "insert into analysis(ahead_id,rhead_id) values(?,?)",
                array("ii",$val->parentId,$val->item_id),true);
    }
    $count=count($data);
} else {
    $val=$data;
    execSQL($con,
            "insert into analysis(ahead_id,rhead_id) values(?,?)",
            array("ii",$val->parentId,$val->item_id),true);
}

if(!$con->commit()) {
    $res->print_error("Cant insert");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
//$res->data = $query_array;
print_r($res->to_json());

?>
