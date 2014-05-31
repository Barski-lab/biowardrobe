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

require_once('../settings.php');


//logmsg($_REQUEST);


$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $res->print_error("no data");

$data->worker = trim($data->worker, "\n\r\t");
$data->lname = trim($data->lname, "\n\r\t");
$data->fname = trim($data->fname, "\n\r\t");

if (strlen($data->worker) == 0 || strlen($data->lname . $data->fname) == 0)
    $response->print_error("Wrong username,lname,fname!");

if ($data->passwd == "*****")
    $data->passwd = "";

if ($data->laboratory_id == "laborato-ry00-0000-0000-000000000001" && $data->worker == "admin" && $worker->worker['admin']) {
    $SQL_STR = "UPDATE worker set changepass=? ";
    $PARAMS = array("i", 0);
} else {
    if (isset($_REQUEST['workers'])) {
        $SQL_STR = "UPDATE worker set worker=?,fname=?,lname=?,dnalogin=?,email=?,notify=?,changepass=?,relogin=?,admin=?,laboratory_id=?";
        $PARAMS = array("sssssiiiis", $data->worker, $data->fname, $data->lname, $data->dnalogin, $data->email, $data->notify, $data->changepass,
            $data->relogin, $data->admin, $data->laboratory_id);
    } else {
        $SQL_STR = "UPDATE worker set fname=?,lname=?,dnalogin=?,email=?,notify=?,changepass=0 ";
        $PARAMS = array("ssssi", $data->fname, $data->lname, $data->dnalogin, $data->email, $data->notify);
    }

    if ($data->dnapass != "*****") {
        array_push($PARAMS, $data->dnapass);
        $PARAMS[0] = $PARAMS[0] . "s";
        $SQL_STR = $SQL_STR . ",dnapass=?";
    }
}

if (isset($_REQUEST['workers']) && ($worker->isLocalAdmin() || $worker->isAdmin())) {
    if (strlen($data->passwd) != 0) {
        array_push($PARAMS, $worker->crypt_pass($data->worker, $data->passwd));
        $PARAMS[0] = $PARAMS[0] . "s";
        $SQL_STR = $SQL_STR . ",passwd=?";
    }
} else if (!isset($_REQUEST['workers'])) {
    if (strlen($data->newpass) != 0) {
        array_push($PARAMS, $worker->crypt_pass($data->worker, $data->newpass));
        $PARAMS[0] = $PARAMS[0] . "s";
        $SQL_STR = $SQL_STR . ",passwd=?";
    }
}

array_push($PARAMS, $data->id);
$PARAMS[0] = $PARAMS[0] . "i";
$SQL_STR = $SQL_STR . " where id=?";

//if others edit someone
if (isset($_REQUEST['workers'])) {

    if (!$worker->isLocalAdmin() && !$worker->isAdmin())
        $response->print_error("Insufficient privileges!");

    if ($worker->isLocalAdmin()) {
        if ($worker->worker['laboratory_id'] != $data->laboratory_id)
            $response->print_error("Insufficient privileges!");

        array_push($PARAMS, $data->laboratory_id);
        $PARAMS[0] = $PARAMS[0] . "s";
        $SQL_STR = $SQL_STR . " and laboratory_id=?";
    }

} else {
    if ($worker->worker['id'] != $data->id)
        $response->print_error("Insufficient privileges!");
}


if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) == 0) {
    $response->print_error("Can't update");
} else {
    $response->success = true;
    $response->message = "Data updated";
    print_r($response->to_json());
}

?>
