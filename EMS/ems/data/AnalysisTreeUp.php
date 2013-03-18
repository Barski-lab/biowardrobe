<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));


function check_data($val) {
    global $data,$con;
    return (execSQL($con,
            "select id from analysis where ahead_id=? and rhead_id=?",
            array("ii",$val->parentId,$val->item_id),false)==0);
}


$con=def_connect();
$con->select_db($db_name_ems);


$count=1;
$con->autocommit(FALSE);

if(gettype($data)=="array") {

    foreach($data as $key => $val ) {
        if(check_data($val)) {
        execSQL($con,
                "insert into analysis(ahead_id,rhead_id,type) values(?,?,?)",
                array("iis",$val->parentId,$val->item_id,$val->type),true);
            $data[$key]->id=$val->parentId.$con->insert_id;
        }
    }
    $count=count($data);
} else {
    $val=$data;
    if(check_data($val)) {
    execSQL($con,
            "insert into analysis(ahead_id,rhead_id,type) values(?,?,?)",
            array("iis",$val->parentId,$val->item_id,$val->type),true);
        $data->id=$val->parentId.$con->insert_id;
    }
}

if(!$con->commit()) {
    $res->print_error("Cant insert");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
$res->data = $data;
print_r($res->to_json());

?>
