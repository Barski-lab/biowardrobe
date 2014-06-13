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


$data = json_decode($_REQUEST['data']);

if (!isset($data))
    $res->print_error("no data");
if ($worker->isAdmin())
    $res->print_error("Admins cant add new project!");

$count = 1;

$con = def_connect();
$con->autocommit(FALSE);

function update_insert($val)
{
    global $con,$worker;
    check_val($val->id);

    if ($val->parentId == "own" && intVal($val->isnew) == 1) {
        execSQL($con, "insert into project2 (id,name,dateadd,worker_id) values(?,?,?,?)",
            array("sssi", $val->id, $val->text, DateTime::createFromFormat('m/d/Y', $val->dateadd)->format('Y-m-d'), intVal($worker->worker['id'])), true);
    }
    if ($val->parentId == "own" && intVal($val->isnew) == 0) {
        execSQL($con, "update project2 set name=?,description=? where id like ?",
            array("sss", $val->text, $val->description, $val->id), true);
    }

}

$retdata = array();

if (gettype($data) == "array") {
    $res->print_error("Cannot be array");
} else {
    $val = $data;
    if ($val->parentId == "own")
        update_insert($val);

    $retdata[] = array("id" => $val->id, "isnew" => 0, "text" => $val->text, 'iconCls' => 'folder-into');
}


if (!$con->commit()) {
    //logmsg(print_r('Cant commit',true));
    $res->print_error("Cant commit");
}

$con->close();

echo json_encode(array(
    'text' => '.',
    'success' => true,
    'data' => $retdata));


//$res->success = true;
//$res->message = "Data loaded";
//$res->total = count($retdata);
//$res->data = $retdata;
//print_r($res->to_json());

?>
