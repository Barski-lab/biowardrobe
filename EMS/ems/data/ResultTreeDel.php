<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

//logmsg("Del");
//logmsg(print_r($_REQUEST,true));

$con=def_connect();
$con->select_db($db_name_ems);

$count=1;

$con->autocommit(FALSE);

if(gettype($data)=="array") {
    foreach($data as $key => $val ) {
        if($val->leaf==true) {
            execSQL($con,
                "delete from resultintersection where rhead_id=? and result_id=?",
                array("ii",$val->parentId,$val->item_id),true);
        }
        if($val->leaf==false) {
            execSQL($con,"delete from result where id in (select result_id from resultintersection where rhead_id=?)",array("i",$val->item_id),true);
            execSQL($con,"delete from resultintersection where rhead_id=?",array("i",$val->item_id),true);
            execSQL($con,"delete from rhead where id=?",array("i",$val->item_id),true);
        }
    }
    $count=count($data);
} else {
    $val=$data;
    if($val->leaf==true) {
        execSQL($con,
            "delete from resultintersection where rhead_id=? and result_id=?",
            array("ii",$val->parentId,$val->item_id),true);
    }
    if($val->leaf==false) {
        execSQL($con,"delete from result where id in (select result_id from resultintersection where rhead_id=?)",array("i",$val->item_id),true);
        execSQL($con,"delete from resultintersection where rhead_id=?",array("i",$val->item_id),true);
        execSQL($con,"delete from rhead where id=?",array("i",$val->item_id),true);
    }
}

if(!$con->commit())
    $res->print_error("Cant delete");


$con->close();


$res->success = true;
$res->message = "Data deleted";
$res->total = $count;
print_r($res->to_json());

?>
