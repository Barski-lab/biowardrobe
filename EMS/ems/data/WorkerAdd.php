<?php
require('common.php');
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$con=def_connect();
$con->select_db($db_name_ems);
$tablename="worker";

$data=json_decode(stripslashes($_REQUEST['data']));
if(!isset($data))
    $res->print_error("no data");
if(!check_rights('worker'))
    $res->print_error("no rights");

$SQL_STR_B="INSERT INTO `$tablename` (worker,fname,lname,passwd";
$SQL_STR_V=") VALUES(?,?,?,?";

$PARAMS=array("ssss",$data->worker,$data->fname,$data->lname,crypt_pass($data->worker,$data->passwd));

if($data->dnalogin!='' && $data->dnapass!='') {
    $SQL_STR_B=$SQL_STR_B.",dnalogin,dnapass ";
    $SQL_STR_V=$SQL_STR_V.",?,? ";

    array_push($PARAMS,$data->dnalogin,$data->dnapass);
    $PARAMS[0]=$PARAMS[0]."ss";
}

if($data->email!='') {
    $SQL_STR_B=$SQL_STR_B.",email,notify ";
    $SQL_STR_V=$SQL_STR_V.",? ";
    array_push($PARAMS,$data->email,($data->notify=='on'?1:0));
    $PARAMS[0]=$PARAMS[0]."si";
}

if(execSQL($con,$SQL_STR_B.$SQL_STR_V.")",$PARAMS,true)==0) {
    $res->print_error("Cant insert");
} else {
    $res->success = true;
    $res->message = "Data has been inserted";
    print_r($res->to_json());
    exit();
}

$res->success = false;
$res->message = "Data is not inserted";
print_r($res->to_json());

$con->close();
?>
