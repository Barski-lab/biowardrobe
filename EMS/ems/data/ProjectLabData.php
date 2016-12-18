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

require_once('../auth.php');


//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));

$SQL_QUERY = "";
$lab_id = "";
$egroup_id = "";

if (isset($_REQUEST['laboratory_id']))
    $lab_id = $_REQUEST['laboratory_id'];
if (isset($_REQUEST['egroup_id']))
    $egroup_id = $_REQUEST['egroup_id'];

if(isset($_REQUEST['isrna']) && intVal($_REQUEST['isrna'])==1) {
    $where.=" and libstatus > 11 and experimenttype_id between 3 and 6 ";
} else {
    $where.=" and libstatus > 11 and experimenttype_id between 1 and 2 ";
}

$query="%";
if(isset($_REQUEST['query'])) {
    $query=$_REQUEST['query'];
    if(!preg_match('/^[a-zA-Z0-9\ ]+$/', $query))
        $res->print_error('Incorrect required parameters.');

    $query='%'.$query.'%';
}


$SQL_QUERY = "FROM labdata $where and deleted=0 ";
$PARAMS = array();

if ($worker->isAdmin()) {
    if ($lab_id != "" && $lab_id != "00000000-0000-0000-0000-000000000000" && $lab_id != "laborato-ry00-0000-0000-000000000001") {
        $SQL_QUERY .= "and laboratory_id=? ";
        $PARAMS = array("s", $lab_id);
    }
} else {
    if ($lab_id != "" && $lab_id != "00000000-0000-0000-0000-000000000000") {
        if ($worker->worker['laboratory_id'] == $lab_id) {
            $SQL_QUERY .= " and (laboratory_id=? or egroup_id in (select id from egroup where laboratory_id=?))";
            $PARAMS = array("ss", $lab_id, $lab_id);
        } else {
            $SQL_QUERY .= " and egroup_id in (select egroup_id from egrouprights where laboratory_id=? ) and laboratory_id=? ";
            $PARAMS = array("ss", $worker->worker['laboratory_id'], $lab_id);
        }
    } else {

        $SQL_QUERY .= "and (laboratory_id=? or (egroup_id in (select egroup_id from egrouprights where laboratory_id=? ) ) or egroup_id in (select id from egroup where laboratory_id=?) )";
        $PARAMS = array("sss", $worker->worker['laboratory_id'], $worker->worker['laboratory_id'], $worker->worker['laboratory_id']);
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

$PARAMS[0].="ssss";
$PARAMS[]=$query;
$PARAMS[]=$query;
$PARAMS[]=$query;
$PARAMS[]=$query;

$total = selectSQL("SELECT count(*) as c " . $SQL_QUERY . " and (cells like ? or conditions like ? or name4browser like ? or author like ?)",$PARAMS)[0]['c'];

$query_array=selectSQL("SELECT * " . $SQL_QUERY . " and (cells like ? or conditions like ? or name4browser like ? or author like ?) {$order} {$limit}",$PARAMS);

$response->success = true;
$response->message = "Data loaded";
$response->total = $total;
$response->data = $query_array;
print_r($response->to_json());

?>
