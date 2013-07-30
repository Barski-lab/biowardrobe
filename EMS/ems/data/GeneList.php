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


$con=def_connect();
$con->select_db($db_name_ems);

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));

if(!isset($_REQUEST['projectid']) || intVal($_REQUEST['projectid'])==0)
    $res->print_error("Not enough arguments.");
$prjid=intVal($_REQUEST['projectid']);

$user_id=$_SESSION["user_id"];

if(!isset($_REQUEST['node'])) {
    $res->print_error("Not enough arguments.");
}
$node=$_REQUEST['node'];

$data=array();

function get_by_id ($parentid) {
    global $con;
    $data=array();
    $qr=execSQL($con,"select * from genelist where parent_id like ? order by name",array("s",$parentid),false);
    foreach($qr as $key => $val) {
        $data[]=array(
            'item_id' => $val['id'],
            'id' => $val['id'],
            'name' => $val['name'],
            'leaf' => !!$val['leaf'],
            'expanded' => false,
            'type' => $val['type'],
            'labdata_id' => $val['labdata_id'],
            'rtype_id' => $val['rtype_id'],
            'atype_id' => $val['atype_id'],
            'project_id' => $val['project_id'],
            'parent_id' => isset($val['parent_id'])?$val['parent_id']:0
        );
    }
    return $data;
}

function get_raw_list ($prjid,$exp='') {
    global $con;
    $data=array();
    $qr=execSQL($con,"select * from genelist where project_id=? and `type` = 1 and parent_id is null order by leaf,name",array("i",$prjid),false);
    foreach($qr as $key => $val) {
        if($exp!=$val['id']) {
            $data[]=array(
                'id' => $val['id'],
                'item_id' => $val['id'],
                'name' => $val['name'],
                'leaf' => !!$val['leaf'],
                'expanded' => false,
                'type' => $val['type'],
                'labdata_id' => $val['labdata_id'],
                'rtype_id' => $val['rtype_id'],
                'atype_id' => $val['atype_id'],
                'project_id' => $val['project_id'],
                'parent_id' => isset($val['parent_id'])?$val['parent_id']:0
             );
         }
     }
     return $data;
}

function get_filtered_list ($prjid) {
    global $con;
    $data=array();
    $qr=execSQL($con,"select * from genelist where project_id=? and `type` = 2 order by name",array("i",$prjid),false);
    foreach($qr as $key => $val) {
        $data[]=array(
               'id' => $val['id'],
               'item_id' => $val['id'],
               'name' => $val['name'],
               'gblink' => $val['gblink'],
               'conditions' => $val['conditions'],
               'leaf' => !!$val['leaf'],
               'expanded' => false,
               'type' => $val['type'],
               'labdata_id' => $val['labdata_id'],
               'rtype_id' => $val['rtype_id'],
               'atype_id' => $val['atype_id'],
               'project_id' => $val['project_id'],
               'parent_id' => isset($val['parent_id'])?$val['parent_id']:0
                );
    }
    return $data;
}

if($node=='root') {
echo json_encode(array(
'text' => '.',
'expanded' => true,
'data' => array(
    array(
        'id' => 'gd',
        'name' => 'Raw Data',
        'leaf' => false,
        'expanded' => true,
        'parent_id' => 'root',
        'data'=>get_raw_list($prjid)),
    array(
        'id' => 'gl',
        'name' => 'Gene List',
        'leaf' => false,
        'expanded' => true,
        'parent_id' => 'root',
        'data'=>get_filtered_list($prjid))
        )
));
}

if($node!='root' && $node!='gd' && $node!='gl') {
    echo json_encode(array(
                     'text' => '.',
                     'expanded' => true,
                     'data' => get_by_id($node)));
}

$con->close();

?>
