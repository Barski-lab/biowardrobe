<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode($_REQUEST['data']);


if(!isset($data))
    $res->print_error("no data");

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));


$con=def_connect();
$con->select_db($db_name_ems);

$count=1;

if(gettype($data)=="array") {
    foreach($data as $key => $val ) {
        if(execSQL($con,"insert into rhead(project_id,name) values(?,?)",array("is",$val->project_id,$val->item),true)==0) {
            $res->print_error("Cant insert");
        }
        $data[$key]->id=$con->insert_id;
        $data[$key]->item_id=$con->insert_id;
    }
    $count=count($data);
} else {
    if(execSQL($con,"insert into rhead(project_id,name) values(?,?)",array("is",$data->project_id,$data->item),true)==0) {
        $res->print_error("Cant insert");
    }
    $data->id=$con->insert_id;
    $data->item_id=$con->insert_id;
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
$res->data = $data;
print_r($res->to_json());

?>
