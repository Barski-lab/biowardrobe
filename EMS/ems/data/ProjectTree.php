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

require("../settings.php");

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));


$user_id = $worker->worker['id'];

$data = array();

if (!isset($_REQUEST['node'])) {
    $response->print_error("Not enough arguments.");
}

function make_array($qr)
{
    $data = array();
    if (!$qr) return $data;
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
    return $data;
}

function make_array_admin($qr)
{
    $data = array();
    if (!$qr) return $data;

    foreach ($qr as $key => $val) {
        $data[] = array(
            'id' => $val['id'],
            'worker_id' => $val['worker_id'],
            'text' => $val['name'],
            'leaf' => true,
            'type' => 0,
            'description' => $val['description'],
            'article' => $val['article'],
            'dateadd' => $val['dateadd'],
            'expanded' => true,
            'iconCls' => 'folder');
    }
    return $data;
}

check_val($_REQUEST['node']);

if ($_REQUEST['node'] != 'root') {
    if ($worker->isAdmin() && strpos($_REQUEST['node'],'wrk_id_') !== false) {
        $wid=intval(substr($_REQUEST['node'],7));
        $qr = selectSQL("select * from project2 where worker_id=$wid order by name", array());
        $data=make_array_admin($qr);
    }
} else {
    if ($worker->isAdmin()) {
        //$qr = selectSQL("select * from project2 order by worker_id,name", array());
        $qr = selectSQL("select concat('wrk_id_',id) as id,id as worker_id,concat(lname,', ',fname) as name,'' as description,'' as article,'' as dateadd from worker order by lname,fname", array());
    } else {
        $qr = selectSQL("select * from project2 where worker_id=?", array("i", $user_id));
    }

    $data[] = array(
        'text' => 'Owned',
        'type' => 1,
        'id' => 'own',
        'expanded' => true,
        'data' => make_array($qr)
    );

    if (!$worker->isAdmin()) {
        $qr = selectSQL("select p.* from project2 p,project2_share ps where p.id=ps.project_id and ps.worker_id=?", array("i", $user_id));

        $data[] = //array($data,
            array(
                'text' => 'Shared',
                'expanded' => true,
                'type' => 1,
                'id' => 'share',
                'data' => make_array($qr)
            );
    }
}

echo json_encode(array(
    'text' => '.',
    'data' => $data
));

?>
