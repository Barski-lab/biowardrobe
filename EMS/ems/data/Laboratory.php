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

//logmsg($_REQUEST);


$array_prepend = array();
$array_prepend[] = array('id' => '00000000-0000-0000-0000-000000000000', 'name' => 'All', 'description' => 'All laboratories');

$PARAMS = array();

if ($worker->isAdmin()) {
    $SQL_STR = "SELECT * FROM laboratory order by name";
    $query_array = selectSQL($SQL_STR, $PARAMS);
} else {
//EDIT list and Local admin !
    if (isset($_REQUEST['rights'])) {
        $array_prepend = array();
        $query_array[] = $worker->group;
    } else {
        $query_array = $worker->allgroups();
    }
}

$result = array_merge($array_prepend, $query_array);

$response->success = true;
$response->message = "Data loaded";
$response->total = count($result);
$response->data = $result;
print_r($response->to_json());

?>
