<?php
/****************************************************************************
 **
 ** Copyright (C) 2011-2015 Andrey Kartashov .
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
//if (!$worker->isAdmin()) {
//    $response->print_error("Insufficient privileges");
//}


if (!isset($_REQUEST['data']) || $_REQUEST['data'] == "") {
    $response->print_error("Data is not set");
}


$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $response->print_error("Data is not set");

$rscript = $data->rscript;
$luid = $data->id;
$name = $data->name;

$r = execSQL(def_connect(), "insert into `advanced_r` (id,name,rscript) values(?,?,?)
    ON DUPLICATE KEY UPDATE id=VALUES(id), rscript=VALUES(rscript);",
    array("sss", $luid, $name, $rscript), true);
if ($r > 2) {
    $response->print_error("Error in database");
}

$response->success = true;
$response->message = "Data updated";
$response->total = 1;
print_r($response->to_json());
?>

