<?php
require('common.php');
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(!check_rights('worker'))
    $res->print_error("no rights");

$con=def_connect();
$con->select_db($db_name_ems);
$tablename="worker";

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");



if(gettype($data)=="array") {
    $SQL_STR="delete from `$tablename` where id in (";
    $PARAMS=array("");

    foreach($data as $key => $val) {
        if(intVal($val->id)==0)
            $res->print_error("no id");

        array_push($PARAMS,intVal($val->id));
        $PARAMS[0]=$PARAMS[0]."i";
        $SQL_STR=$SQL_STR."?,";
    }

    $SQL_STR = substr_replace($SQL_STR ,"",-1);
    $SQL_STR=$SQL_STR.")";
} else {
    if(intVal($data->id)==0)
        $res->print_error("no id");

    $SQL_STR="delete from `$tablename` where id=?";

    $PARAMS=array("i",intVal($data->id));

}

if(execSQL($con,$SQL_STR,$PARAMS,true)!=0) {
    $res->success = true;
    $res->message = "Data has deleted";
    print_r($res->to_json());
    exit();
}


$res->success = false;
$res->message = "Data is not deleted";
print_r($res->to_json());

$con->close();
?>
