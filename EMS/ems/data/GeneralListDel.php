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


//logmsg($_REQUEST);

//*****************************************************************
function delete_data($val)
{
    $PARAMS[] = "";
    $SQL_STR = "";
    global $IDFIELD, $IDFIELDTYPE, $settings, $tablename, $types, $res, $_SESSION;

    if (!execSQL($settings->connection, "delete from `$tablename` where $IDFIELD=?", array($IDFIELDTYPE, $val->$IDFIELD), true))
        $res->print_error("Cant delete");
}

//*****************************************************************

if (!$worker->isAdmin() && !$worker->isLocalAdmin()) {
    $response->print_error("Insufficient privileges");
}

if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

$data = json_decode(stripslashes($_REQUEST['data']));

if (!isset($data))
    $res->print_error("no data");

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "genome");

$IDFIELD = 'id';
$IDFIELDTYPE = "i";
if($tablename=="antibody")
    $IDFIELDTYPE = "s";

if (!in_array($tablename, $AllowedTable)) {
    $res->print_error('Table not in the list');
} else {
    $con = def_connect();
}
$con->autocommit(FALSE);
$total = -1;

if (gettype($data) == "array") {
    foreach ($data as $key => $val) {
        delete_data($val);
    }
    $count = count($data);
} else {
    delete_data($data);
}

if (!$con->commit()) {
    $res->print_error("Cant delete");
}

$con->close();

$res->success = true;
$res->message = "Data updated";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());
?>
