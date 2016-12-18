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

//logmsg(print_r($_REQUEST,true));

$array_prepend = array();
$PARAMS = array();

if (!$_REQUEST['egroup_id']) {
    $response->success = true;
    $response->message = "Data loaded";
    $response->total = 0;
    $response->data = array();
    print_r($response->to_json());
    exit();
}

$SQL_STR = "select l.id,l.name,l.description,e.egroup_id,eg.id as locked
from ems.laboratory l
left join (ems.egrouprights e) on l.id=e.laboratory_id and e.egroup_id=?
left join ems.egroup eg on eg.laboratory_id=l.id and eg.id=?
where l.name not like 'admin';";

if($worker->isAdmin()) {
    //$PARAMS = array("ss", $_REQUEST['egroup_id'],$_REQUEST['laboratory_id']);
    $PARAMS = array("ss", $_REQUEST['egroup_id'],$_REQUEST['egroup_id']);
} else {
    $PARAMS = array("ss", $_REQUEST['egroup_id'],$_REQUEST['egroup_id']);
}


$query_array = selectSQL($SQL_STR, $PARAMS);

$result = array_merge($array_prepend, $query_array);

$response->success = true;
$response->message = "Data loaded";
$response->total = count($result);
$response->data = $result;
print_r($response->to_json());

?>
