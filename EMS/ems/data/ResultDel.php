<?php

require_once('../auth.php');

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

$con=def_connect();
$con->select_db($db_name_ems);


function del_data($data,$con) {
        global $db_name_experiments;
        execSQL($con,"update ahead set status=0 where id in(select ahead_id from result where id =?)",array("i",intVal($data->id)),true);

        $result=execSQL($con,"SELECT tableName FROM result WHERE id=?",array("i",$data->id),false);
        if($result != 0 )
            foreach($result as $a => $b ) {
                $con->query("DROP TABLE IF EXISTS `$db_name_experiments`.`".$b["tableName"]."`");
            }

        execSQL($con,"delete from result where id=?",array("i",intVal($data->id)),true);

//        execSQL($con, "delete from resultintersection where rhead_id=? and result_id=?",
//                array("ii",$data->parentId,$data->item_id),true);


//    if($data->leaf==false) {

//        execSQL($con,"update ahead set status=0 where id in(select ahead_id from analysis where rhead_id =?)",array("i",intVal($data->id)),true);

//        $result=execSQL($con,"SELECT tableName FROM result WHERE labdata_id is NULL and ahead_id in (select ahead_id from analysis where rhead_id =?)",array("i",$data->id),false);
//        if($result != 0 )
//            foreach($result as $a => $b ) {
//                $con->query("DROP TABLE IF EXISTS `$db_name_experiments`.`".$b["tableName"]."`");
//            }

//        execSQL($con,"delete from result where ahead_id in (select ahead_id from analysis where rhead_id=?)",array("i",intVal($data->id)),true);

//        execSQL($con,"delete from analysis where rhead_id =?",array("i",intVal($data->id)),true);

//        execSQL($con,"DELETE a.*, b.* FROM result a LEFT JOIN resultintersection b ON b.result_id = a.id
//        WHERE b.rhead_id=?",array("i",intVal($data->id)),true);
//        execSQL($con,"delete from rhead where id=?",array("i",intVal($data->id)),true);
//    }
}


$con->autocommit(FALSE);

if(gettype($data)=="array") {
    foreach($data as $a => $b) {
        del_data($b,$con);
    }
} else {
    del_data($data,$con);
}


if(!$con->commit()) {
    $res->print_error("Cant delete");
}

$con->close();
$res->success = true;
$res->message = "Data deleted";
print_r($res->to_json());

?>
