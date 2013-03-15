<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode($_REQUEST['data']);

if(!isset($data))
    $res->print_error("no data");

logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
logmsg(print_r($data,true));


$con=def_connect();
$con->select_db($db_name_ems);

$count=1;

$con->autocommit(FALSE);

if(gettype($data)=="array") {
    foreach($data as $key => $val ) {
        if(intVal($val->id) == intVal($val->item_id)) {
            execSQL($con,
                    "insert into result(project_id,name,description,rtype_id,labdata_id,tablename) values(?,?,?,?,?,(select filename from labdata where id=?))",
                    array("issiii",$val->project_id,$val->item,$val->description,$val->rtype_id,$val->id,$val->id),true);

            execSQL($con,
                    "insert into resultintersection(result_id,rhead_id) values(?,?)",
                    array("ii",$con->insert_id,$val->parentId),true);
        } else {
            execSQL($con,
                    "update result set name=?,description=? where id=?",
                    array("ssi",$val->item,$val->description,$val->item_id),true);
        }
    }
    $count=count($data);
} else {
    $val=$data;
    execSQL($con,
            "insert into result(project_id,name,description,rtype_id,labdata_id,tablename) values(?,?,?,?,?,(select filename from labdata where id=?))",
            array("issiii",$val->project_id,$val->item,$val->description,$val->rtype_id,$val->id,$val->id),true);

    execSQL($con,
            "insert into resultintersection(result_id,rhead_id) values(?,?)",
            array("ii",$con->insert_id,$val->parentId),true);
}

if(!$con->commit()) {
    $res->print_error("Cant update");
}

$con->close();


$res->success = true;
$res->message = "Data updated";
$res->total = $count;
//$res->data = $query_array;
print_r($res->to_json());

?>
