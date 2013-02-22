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
if(intVal($data->id)==0)
    $res->print_error("no id");
if($data->passwd=='' && !check_rights('worker'))
    $res->print_error("no passwd");

if(!check_rights('worker') && $_SESSION["username"]!=$data->worker)
    $res->print_error("How it is possible?");

logmsg(print_r($data,true));
//logmsg(print_r($_REQUEST,true));

$SQL_STR="UPDATE `$tablename` set worker=?,fname=?,lname=?,dnalogin=?,dnapass=?,email=?,notify=?";
$PARAMS=array("ssssssi",$data->worker,$data->fname,$data->lname,$data->dnalogin,$data->dnapass,$data->email,($data->notify=='on'?1:0));

if($data->newpass!='') {
    $SQL_STR=$SQL_STR.",passwd=? ";

    array_push($PARAMS,crypt_pass($data->worker,$data->newpass));
    $PARAMS[0]=$PARAMS[0]."s";
}

$SQL_STR=$SQL_STR." where id=?";
array_push($PARAMS,$data->id);
$PARAMS[0]=$PARAMS[0]."i";

$result=execSQL($con,"select passwd from `$tablename` where id=?",array("i",$data->id),false);
if(sizeof($result) != 1) {
    $res->print_error("Something wrong");
}

$crp=crypt_pass($data->worker,$data->passwd);
if($data->passwd==$result[0]['passwd'] || $crp==$result[0]['passwd'] || check_rights('worker')) {
    if(execSQL($con,$SQL_STR,$PARAMS,true)==0) {
        $res->print_error("Cant update");
    } else {
        $res->success = true;
        $res->message = "Data updated";
        print_r($res->to_json());
        exit();
    }
}

$res->success = false;
$res->message = "Data not updated";
print_r($res->to_json());

$con->close();
?>
