<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con=def_connect();
$con->select_db($db_name_ems);

//logmsg('request');
//logmsg(print_r($_REQUEST,true));

if(!isset($_REQUEST['projectid']))
    $res->print_error("Not enough arguments.");

$prjid=intVal($_REQUEST['projectid']);

$data=array();

if($_REQUEST['id']=='root') {
    $query_array=execSQL($con,"SELECT * FROM rhead where project_id=?",array("i",$prjid),false);
    foreach($query_array as $key => $val) {
        $data[]=array(
            'item_id' => $val['id'],
            'project_id' => $prjid,
            'item' => $val['name'],
            'leaf' => false,
            'id' => $val['id'],
            'expanded' => false,
            'iconCls' => 'folder-into'
            );
    }
} else {
    if(!isset($_REQUEST['id']) || intVal($_REQUEST['id'])==0)
        $res->print_error("Not enough arguments.");
    $parentid=intVal($_REQUEST['id']);

    $query_array=execSQL($con,"SELECT re.id,re.name,re.description,re.rtype_id FROM result re, resultintersection r where result_id=re.id and rhead_id=? order by re.name",array("i",$parentid),false);
    foreach($query_array as $key => $val) {
        $data[]=array(
            'item_id' => $val['id'],
            'project_id' => $prjid,
            'item' => $val['name'],
            'description' => $val['description'],
            'leaf' => true,
            'id' => $val['name'].$val['id'],
            'rtype_id' => $val['rtype_id']
            );
    }
}
$con->close();

//logmsg(print_r($data,true));
//logmsg(print_r($val,true));

echo json_encode(array(
                     'text' => '.',
                     'data' => $data));

?>
