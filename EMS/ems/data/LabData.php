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

$SQL_QUERY = "";
$lab_id = "";
$egroup_id = "";

if (isset($_REQUEST['laboratory_id']))
    $lab_id = $_REQUEST['laboratory_id'];
if (isset($_REQUEST['egroup_id']))
    $egroup_id = $_REQUEST['egroup_id'];

$SQL_QUERY = "FROM labdata $where and deleted=0 ";
$PARAMS = array();

if ($worker->isAdmin()) {
    if ($lab_id != "" && $lab_id != "00000000-0000-0000-0000-000000000000" && $lab_id != "laborato-ry00-0000-0000-000000000001") {
        $SQL_QUERY .= "and laboratory_id=? ";
        $PARAMS = array("s", $lab_id);
    }
} else {
    if ($lab_id != "" && $lab_id != "00000000-0000-0000-0000-000000000000") {
        if($worker->worker['laboratory_id']==$lab_id) {
            $SQL_QUERY .= " and laboratory_id=? ";
            $PARAMS = array("s", $lab_id);
        } else {
            $SQL_QUERY .= " and egroup_id in (select egroup_id from egrouprights where laboratory_id=? ) and laboratory_id=? ";
            $PARAMS = array("ss",$worker->worker['laboratory_id'], $lab_id);
        }
    } else {

        $SQL_QUERY .= "and (laboratory_id=? or (egroup_id in (select egroup_id from egrouprights where laboratory_id=? ) ) )";
        $PARAMS = array("ss", $worker->worker['laboratory_id'],$worker->worker['laboratory_id']);
    }
}

if ($egroup_id != "" && $egroup_id != "00000000-0000-0000-0000-000000000000") {
    $SQL_QUERY .= "and egroup_id=?";
    if (count($PARAMS) != 0) {
        $PARAMS[0] .= "s";
        $PARAMS[] = $egroup_id;
    } else {
        $PARAMS = array("s", $egroup_id);
    }
}

$total = selectSQL("SELECT COUNT(*) as count " . $SQL_QUERY, $PARAMS)[0]['count'];
$query_array = selectSQL("SELECT * " . $SQL_QUERY . " $order $limit", $PARAMS);

$response->success = true;
$response->message = "Data loaded";
$response->total = $total;
$response->data = $query_array;
print_r($response->to_json());
?>
