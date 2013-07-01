<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode($_REQUEST['data']);

logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
logmsg(print_r($data,true));

if(!isset($data))
    $res->print_error("no data");

$con=def_connect();
$con->select_db($db_name_ems);

$count=1;


if(gettype($data)=="array") {
    foreach($data as $key => $val ) {
        if($val->leaf==true) continue;
        if($val->parentId=="root") {
            if(execSQL($con,"insert into ahead(project_id,name,atype_id) values(?,?,?)",array("isi",$val->project_id,$val->item,$val->atype_id),true)==0) {
                $res->print_error("Cant insert");
            }
            $data[$key]->id=$con->insert_id;
            $data[$key]->item_id=$con->insert_id;
        } else {
            if(execSQL($con,"insert into analysis(ahead_id,rhead_id) values(?,?)",array("ii",$val->parentId,$val->item_id),true)==0)
                $res->print_error("Cant insert");
            $data[$key]->leaf=true;
            $data[$key]->id=$val->parentId.$con->insert_id;
        }

    }
    $count=count($data);
} else {
    $val=$data;
    if($val->leaf==false)
    if($val->parentId=="root") {
        if(execSQL($con,"insert into ahead(project_id,name,atype_id) values(?,?,?)",array("isi",$val->project_id,$val->item,$val->atype_id),true)==0) {
            $res->print_error("Cant insert");
        }
        $data->id=$con->insert_id;
        $data->item_id=$con->insert_id;
    } else {
        if(execSQL($con,"insert into analysis(ahead_id,rhead_id) values(?,?)",array("ii",$val->parentId,$val->item_id),true)==0)
            $res->print_error("Cant insert");
        $data->leaf=true;
        $data->id=$val->parentId.$con->insert_id;
    }

}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
$res->data = $data;
print_r($res->to_json());

?>
