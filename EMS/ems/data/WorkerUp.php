<?php
/****************************************************************************
 **
 ** Copyright (C) 2011 Andrey Kartashov .
 ** All rights reserved.
 ** Contact: Andrey Kartashov (porter@porter.st)
 **
 ** This file is part of the EMS web interface module of the genome-tools.
 **
 ** GNU Lesser General Public License Usage
 ** This file may be used under the terms of the GNU Lesser General Public
 ** License version 2.1 as published by the Free Software Foundation and
 ** appearing in the file LICENSE.LGPL included in the packaging of this
 ** file. Please review the following information to ensure the GNU Lesser
 ** General Public License version 2.1 requirements will be met:
 ** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
 **
 ** Other Usage
 ** Alternatively, this file may be used in accordance with the terms and
 ** conditions contained in a signed written agreement between you and Andrey Kartashov.
 **
 ****************************************************************************/

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));

$con=def_connect();
$con->select_db($db_name_ems);
$tablename="worker";

$data=json_decode($_REQUEST['data']);
if(!isset($data))
    $res->print_error("no data");
if(intVal($data->id)==0)
    $res->print_error("no id");

if($data->passwd=='' && !check_rights('worker'))
    $res->print_error("no passwd");

if(!check_rights('worker') && $_SESSION["username"]!=$data->worker)
    $res->print_error("How it is possible?");

//logmsg(print_r($data,true));
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

$salt = substr($result[0]['passwd'], 0, 64);
$hash = $salt . $data->passwd;
for ($i = 0; $i < 100000; $i++) {
    $hash = hash('sha256', $hash);
}
$hash = $salt . $hash;

if($hash == $result[0]['passwd'] || check_rights('worker')) {
    if(execSQL($con,$SQL_STR,$PARAMS,true)==0) {
        $res->print_error("Can't update");
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
