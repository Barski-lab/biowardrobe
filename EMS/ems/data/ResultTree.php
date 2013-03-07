<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con=def_connect();
$con->select_db($db_name_ems);

logmsg('request');
logmsg(print_r($_REQUEST,true));

if(!isset($_REQUEST['projectid']))
    $res->print_error("Not enough arguments.");

$prjid=intVal($_REQUEST['projectid']);

//$result=execSQL($con,"SELECT name FROM project where id=?",array("i",$prjid),false);
//$prjname=$result[0]['name'];

$data=array();

if($_REQUEST['id']=='root') {
    $query_array=execSQL($con,"SELECT * FROM rhead where project_id=?",array("i",$prjid),false);
    foreach($query_array as $key => $val) {
        $data[]=array(
            'item_id' => $val['id'],
            'item' => $val['name'],
            'leaf' => false,
            'id' => $val['id'],
            'expanded' => false,
            'iconCls' => 'folder-into'
            );
    }
}
$con->close();

//logmsg(print_r($data,true));
//logmsg(print_r($val,true));

echo json_encode(array(
                     'text' => '.',
                     'iconCls' => 'folder',
                     'data' => $data));

?>
