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

require_once('../auth.php');


//logmsg($_REQUEST);


$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $res->print_error("no data");


if (!$worker->isAdmin() && !$worker->isLocalAdmin())
    $response->print_error("Insufficient privileges!");


if ($worker->isLocalAdmin() && ($worker->worker['laboratory_id'] != $data->laboratory_id))
    $response->print_error("Insufficient privileges!");


if ($data->laboratory_id == "laborato-ry00-0000-0000-000000000001" && $data->worker == "admin")
    $response->print_error("Can't change admin!");


$data->worker = trim($data->worker, "\n\r\t");
$data->lname = trim($data->lname, "\n\r\t");
$data->fname = trim($data->fname, "\n\r\t");


if (strlen($data->worker) == 0 || strlen($data->lname . $data->fname) == 0)
    $response->print_error("Wrong username,lname,fname!");

$SQL_STR = "insert into worker(worker,passwd,fname,lname,dnalogin,dnapass,email,notify,changepass,relogin,admin,laboratory_id) values(?,?,?,?,?,?,?,?,?,?,?,?)";
$PARAMS = array("sssssssiiiis", $data->worker, $worker->crypt_pass($data->worker, $data->passwd), $data->fname, $data->lname, $data->dnalogin, $data->dnapass, $data->email,
    $data->notify, $data->changepass, $data->relogin, $data->admin, $data->laboratory_id);

if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) == 0) {
    $response->print_error("Can't insert");
} else {
    $response->success = true;
    $response->message = "Data is inserted";
    print_r($response->to_json());
}

//$data=json_decode($_REQUEST['data']);
//if(!isset($data))
//    $res->print_error("no data");
//
//$SQL_STR_B="INSERT INTO `$tablename` (worker,fname,lname,passwd";
//$SQL_STR_V=") VALUES(?,?,?,?";
//
//$PARAMS=array("ssss",$data->worker,$data->fname,$data->lname,crypt_pass($data->worker,$data->passwd));
//
//if($data->dnalogin!='' && $data->dnapass!='') {
//    $SQL_STR_B=$SQL_STR_B.",dnalogin,dnapass ";
//    $SQL_STR_V=$SQL_STR_V.",?,? ";
//
//    array_push($PARAMS,$data->dnalogin,$data->dnapass);
//    $PARAMS[0]=$PARAMS[0]."ss";
//}
//
//if($data->email!='') {
//    $SQL_STR_B=$SQL_STR_B.",email,notify ";
//    $SQL_STR_V=$SQL_STR_V.",?,? ";
//    array_push($PARAMS,$data->email,($data->notify=='on'?1:0));
//    $PARAMS[0]=$PARAMS[0]."si";
//}
//
//if(execSQL($con,$SQL_STR_B.$SQL_STR_V.")",$PARAMS,true)==0) {
//    $res->print_error("Cant insert");
//} else {
//    $res->success = true;
//    $res->message = "Data has been inserted";
//    print_r($res->to_json());
//    exit();
//}

?>
