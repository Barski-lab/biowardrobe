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

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con = def_connect();
$con->select_db($db_name_ems);

$user_id = $_SESSION["user_id"];

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));

$data = array();


if (!isset($_REQUEST['node'])) {
    $res->print_error("Not enough arguments.");
}

check_val($_REQUEST['node']);

if ($_REQUEST['node'] != 'root') {
} else {
    if (check_rights('ProjectTree')) {
        $qr = execSQL($con, "select * from project2", array(), false);
    } else {
        $qr = execSQL($con, "select * from project2 where worker_id=?", array("i", $user_id), false);
    }
    foreach ($qr as $key => $val) {
        $data[] = array(
            'id' => $val['id'],
            'worker_id' => $val['worker_id'],
            'text' => $val['name'],
            'leaf' => false,
            'type' => 0,
            'description' => $val['description'],
            'article' => $val['article'],
            'dateadd' => $val['dateadd'],
            'expanded' => false,
            'iconCls' => 'folder-into');
    }
}

$con->close();


echo json_encode(array(
    'text' => '.',
    'data' => $data));

?>
