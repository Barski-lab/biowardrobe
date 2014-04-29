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

//logmsg($_REQUEST);

if (!$worker->isAdmin() && !$worker->isLocalAdmin())
    $response->print_error("Insufficient credentials");

//*****************************************************************
function update_data($val)
{
    $PARAMS[] = "";
    $SQL_STR = "";
    global $IDFIELD, $IDFIELDTYPE, $settings, $tablename, $types, $response;

    foreach ($val as $f => $d) {

        if (!array_key_exists($f, $types))
            $response->print_error("Table field does not exist $f");

        if ($f == $IDFIELD) {
            $id = $d;
            $IDFIELDTYPE = $types[$f];
            continue;
        }


        //FIXME: end of field eq _id
        if (strrpos($f, "_id") !== false && ($types[$f] != "s" && intVal($d) == 0)) {
            $SQL_STR = $SQL_STR . " $f=null,";
            continue;
        }

        switch ($tablename) {
            case "settings":
                if (in_array($f, array("key", "description","status"))
                continue;
                break;
        }

        $SQL_STR = $SQL_STR . " $f=?,";

        if ($types[$f] == "dd") {
            $date = DateTime::createFromFormat('m/d/Y', $d);
            $PARAMS[] = $date->format('Y-m-d');
            $PARAMS[0] = $PARAMS[0] . "s";
        } else {
            $PARAMS[] = $d;
            $PARAMS[0] = $PARAMS[0] . $types[$f];
        }
    }

    $PARAMS[] = $id;
    $PARAMS[0] = $PARAMS[0] . $IDFIELDTYPE;

    $SQL_STR = substr_replace($SQL_STR, "", -1);
    $SQL_STR = "update `$tablename` set $SQL_STR where $IDFIELD=?";


    execSQL($settings->connection, $SQL_STR, $PARAMS, true);
}

//*****************************************************************
if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $response->print_error('Not enough required parameters. t');

$data = json_decode($_REQUEST['data']);

if (!isset($data))
    $response->print_error("no data");

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "info", "settings");

$IDFIELD = "id";
$IDFIELDTYPE = "i";

if (!in_array($tablename, $AllowedTable)) {
    $response->print_error('Table not in the list');
} else {
    switch ($tablename) {
//        case "grp_local":
//
//            $IDFIELD = "name";
//            $IDFIELDTYPE = "s";
//
//            if (isset($_REQUEST['genomedb'])) {
//                check_val($_REQUEST['genomedb']);
//                $gdb = $_REQUEST['genomedb'];
//            } else {
//                $response->print_error('Not enough required parameters.');
//            }
//
//            $con = new mysqli($db_host_gb, $db_user_gb, $db_pass_gb);
//            if ($con->connect_errno)
//                $response->print_error('Could not connect: ' . $con->connect_error);
//            if (!$con->select_db($gdb))
//                $response->print_error('Could not select db: ' . $con->connect_error);
//
//            break;
        default:
            break;
    }
}
$total = 1;

$settings->connection->autocommit(FALSE);

if (($table = selectSQL("describe `$tablename`", array())) == 0)
    $resposne->print_error("Cant describe");

$types = array();
foreach ($table as $dummy => $val) {
    $t = "s";
    if (strrpos($val["Type"], "int") !== false)
        $t = "i";
    elseif (strrpos($val["Type"], "float") !== false)
        $t = "d";
    elseif (strrpos($val["Type"], "double") !== false)
        $t = "d";
    elseif (strrpos($val["Type"], "date") !== false)
        $t = "dd";

    $types[$val["Field"]] = $t;
}

if (gettype($data) == "array") {
    foreach ($data as $key => $val) {
        update_data($val);
    }
    $count = count($data);
} else {
    update_data($data);
}

if (!$settings->connection->commit()) {
    $response->print_error("Cant update");
}


$response->success = true;
$response->message = "Data updated";
$response->total = $total;
$response->data = $query_array;
print_r($response->to_json());
?>
