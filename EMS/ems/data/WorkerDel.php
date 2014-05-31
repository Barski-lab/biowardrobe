<?php
/****************************************************************************
 **
 ** Copyright (C) 2011-2014 Andrey Kartashov .
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

$data = json_decode(stripslashes($_REQUEST['data']));

if (!isset($data))
    $response->print_error("no data");

if(!$worker->isAdmin() && !$worker->isLocalAdmin())
    $response->print_error('Insufficient priviliges!');

if($data->worker == 'admin')
    $response->print_error('Insufficient priviliges!');

if (intVal($data->id) == 0)
    $response->print_error("no id");

$query = selectSQL("SELECT * from worker where id=?", array("i", $data->id));
if (count($query) != 1)
    $response->print_error("Cant select worker!");
$query=$query[0];

if($query['worker'] == 'admin')
    $response->print_error('Insufficient priviliges!');

if($worker->isLocalAdmin() && ($query['admin']==1 || $worker->worker['laboratory_id'] !=$query['laboratory_id'] ))
    $response->print_error('Insufficient priviliges!');

$SQL_STR="delete from `worker` where id=?";
$PARAMS=array("i",$data->id);

if (execSQL($settings->connection, $SQL_STR, $PARAMS, true) != 0) {
    $response->success = true;
    $response->message = "Data has been deleted";
} else {
    $response->success = false;
    $response->message = "Data is not deleted";
}
print_r($response->to_json());
?>
