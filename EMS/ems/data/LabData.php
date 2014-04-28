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

if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $response->print_error('Not enough required parameters. t');

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "info", "download", "settings");

if (!in_array($tablename, $AllowedTable))
    $response->print_error('Table not in the list');

/*
switch ($tablename) {
    case "labdata":
        if (isset($_REQUEST['workerid'])) //select different users
            $workerid = intVal($_REQUEST['workerid']);
        else
            $workerid = $_SESSION["user_id"];

        if (isset($_REQUEST['typeid'])) {
            $typeid = intVal($_REQUEST['typeid']);

            if ($typeid >= 1 && $typeid <= 3)
                $where = $where . " and libstatus > 20 and experimenttype_id between 3 and 6 ";
            elseif ($typeid == 4)
                $where = $where . " and libstatus > 11 and experimenttype_id between 1 and 2 ";
            else
                $response->print_error('Not yet supported.');
        }

        if ($workerid != 0)
            $where = $where . " and worker_id=$workerid ";

        break;
    case "grp_local":
        if (isset($_REQUEST['genomedb']) && isset($_REQUEST['genomenm'])) {
            check_val($_REQUEST['genomedb']);
            if ($_REQUEST['genomenm'] != "") check_val($_REQUEST['genomenm']);
            $gdb = $_REQUEST['genomedb'];
            $gnm = $_REQUEST['genomenm'];
        } else {
            $response->print_error('Not enough required parameters.');
        }
        $where = $where . " and name like '$gnm%'";

        $con = def_connect();
        if (!$con->select_db($gdb)) {
            $response->print_error('Could not select db: ' . $con->connect_error);
        }
        break;
    default:
        break;
}
*/

if (!($totalquery = $settings->connection->query("SELECT COUNT(*) FROM `$tablename` $where"))) {
    $response->print_error("Exec failed: (" . $con->errno . ") " . $settings->connection->error);
}
$row = $totalquery->fetch_row();
$total = $row[0];

$query_array = selectSQL("SELECT * FROM `$tablename` $where $order $limit", array());

$response->success = true;
$response->message = "Data loaded";
$response->total = $total;
$response->data = $query_array;
print_r($response->to_json());
?>
