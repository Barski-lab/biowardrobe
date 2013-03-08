<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

logmsg("Del");
logmsg(print_r($_REQUEST,true));

$con=def_connect();
$con->select_db($db_name_ems);

$count=1;

$con->autocommit(FALSE);

if(gettype($data)=="array") {
//    foreach($data as $key => $val ) {
//        execSQL($con,
//                "insert into result(project_id,name,description,rtype_id,labdata_id,tablename) values(?,?,?,?,?,(select filename from labdata where id=?))",
//                array("issiii",$val->project_id,$val->item,$val->description,$val->rtype_id,$val->id,$val->id),true);

//        execSQL($con,
//                "insert into resultintersection(result_id,rhead_id) values(?,?)",
//                array("ii",$con->insert_id,$val->parentId),true);
//    }
//    $count=count($data);
} else {
//    $val=$data;
//    execSQL($con,
//            "insert into result(project_id,name,description,rtype_id,labdata_id,tablename) values(?,?,?,?,?,(select filename from labdata where id=?))",
//            array("issiii",$val->project_id,$val->item,$val->description,$val->rtype_id,$val->id,$val->id),true);

//    execSQL($con,
//            "insert into resultintersection(result_id,rhead_id) values(?,?)",
//            array("ii",$con->insert_id,$val->parentId),true);
}

//if(!$con->commit()) {
//    $res->print_error("Cant insert");
//}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
//$res->data = $query_array;
print_r($res->to_json());

?>
