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

//logmsg(print_r($_REQUEST,true));


$array_prepend = array();
//$array_prepend[] = array('id' => '00000000-0000-0000-0000-000000000000', 'name' => 'All', 'description' => 'All laboratories');

$PARAMS = array();

if ($worker->isAdmin()) {
    $SQL_STR = "SELECT * FROM egroup ";
    if (isset($_REQUEST['laboratory']) && $_REQUEST['laboratory'] != "00000000-0000-0000-0000-000000000000") {
        $SQL_STR = $SQL_STR . " where laboratory_id=?";
        $PARAMS = array("s", $_REQUEST['laboratory']);
    }
} else {
//EDIT list and Local admin !
    if ($worker->isLocalAdmin() && isset($_REQUEST['laboratory'])) {
        $SQL_STR = "SELECT * FROM egroup where laboratory_id=?";
        $PARAMS = array("s", $worker->worker['laboratory_id']);
    } else {
        $SQL_STR = "SELECT * FROM egroup where laboratory_id=?";
        $PARAMS = array("s", $worker->worker['laboratory_id']);
    }
}
$SQL_STR = $SQL_STR . " order by priority DESC, name";

//else {
//    //FIXME: have to always choose my own labaratory (maybe $worker->groups will work)
//    $SQL_STR = "SELECT distinct l.name, l.description FROM laboratory l, egroup e, egrouprights er where (er.laboratory_id=? and egroup_id=e.id and e.laboratory_id=l.id) order by name";
//    $PARAMS=array("s",$worker->worker['laboratory_id']);
//}


$query_array = selectSQL($SQL_STR, $PARAMS);

$result = array_merge($array_prepend, $query_array);

$response->success = true;
$response->message = "Data loaded";
$response->total = count($result);
$response->data = $result;
print_r($response->to_json());

?>
