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

logmsg($_REQUEST);

$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $res->print_error("Data is not set");

if (!isset($_REQUEST['moveto'])
    || $_REQUEST['moveto'] == ""
    || $_REQUEST['moveto'] == "00000000-0000-0000-0000-000000000000"
    || $_REQUEST['moveto'] == "laborato-ry00-0000-0000-000000000001"
) {
    $response->print_error("Move to error");
}

$moveto = $_REQUEST['moveto'];
if($moveto==$data->id)
    $response->print_error("Cant move to itself");

if ($worker->isAdmin()) {
    $SQL_STR = "update labdata set egroup_id=? where egroup_id=?";
    $PARAMS = array("ss", $moveto, $data->id);
    if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) < 0)
        $response->print_error("Cant move");

    $SQL_STR = "delete from egrouprights where egroup_id=?";
    $PARAMS = array("s",$data->id);
    if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) < 0)
        $response->print_error("Cant remove rights");

    $SQL_STR = "delete from egroup where id=?";
    $PARAMS = array("s", $data->id);

} elseif ($worker->isLocalAdmin()) {
    $SQL_STR = "update labdata set egroup_id=? where egroup_id=? and laboratory_id=?";
    $PARAMS = array("sss", $moveto, $data->id,$worker->worker['laboratory_id']);
    if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) < 0)
        $response->print_error("Cant move");

    $SQL_STR = "delete from egrouprights where egroup_id=(select id from egroup where id=? and laboratory_id=?)";
    $PARAMS = array("ss",$data->id,$worker->worker['laboratory_id']);
    if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) < 0)
        $response->print_error("Cant remove rights");

    $SQL_STR = "delete from egroup where id=? and laboratory_id=?";
    $PARAMS = array("ss", $data->id,$worker->worker['laboratory_id']);

}else {
    $response->print_error("Insufficient privileges");
}

if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) == 0)
    $response->print_error("Cant delete");

$response->success = true;
$response->message = "Data deleted";
$response->total = 1;
$response->data = $data;
print_r($response->to_json());

?>
