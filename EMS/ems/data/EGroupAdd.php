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

logmsg($_REQUEST);

$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $response->print_error("Data is not set");

if($data->laboratory_id=="00000000-0000-0000-0000-000000000000" || $data->laboratory_id=="laborato-ry00-0000-0000-000000000001" ) {
    $response->print_error("Insufficient privileges");
}

if($data->name == "" || $data->description=="")
    $response->print_error("Error in receiving data");


if ($worker->isAdmin() && $data->laboratory_id != "") {
    $PARAMS = array("ssssss", guid(), $data->laboratory_id, "", $data->name, $data->description, $data->priority);
} elseif ($worker->isLocalAdmin()) {
    $PARAMS = array("ssssss", guid(), $worker->worker['laboratory_id'], "", $data->name, $data->description, $data->priority);
}
else {
    $response->print_error("Insufficient privileges");
}
$SQL_STR = "insert into egroup values(?,?,?,?,?,?)";

if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) == 0)
    $response->print_error("Cant insert");

$response->success = true;
$response->message = "Data inserted";
$response->total = 1;
$response->data = $data;
print_r($response->to_json());

?>
