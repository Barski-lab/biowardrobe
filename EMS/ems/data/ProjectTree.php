<?php

   require("common.php");
   require_once('response.php');
   require_once('def_vars.php');
   require_once('database_connection.php');


$con=def_connect();
$con->select_db($db_name_ems);

$user_id=$_SESSION["user_id"];

logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));

$data=array();



if(!isset($_REQUEST['node'])) {
    $res->print_error("Not enough arguments.");
}

if(intVal($_REQUEST['node']) > 0) {
} else {
        //$qr=execSQL($con,"select * from project where worker_id=?",array("i",$user_id),false);
        $qr=execSQL($con,"select * from project",array(),false);
        foreach($qr as $key => $val) {
            $data[]=array(
            'id' => $val['id'],
            'worker_id' => $val['worker_id'],
            'text' => $val['name'],
            'leaf' => false,
            'type' => 1,
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
