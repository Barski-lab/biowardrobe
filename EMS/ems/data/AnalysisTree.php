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


function get_by_id ($parentid,$prjid,$status) {
    global $con;
    $data=array();
    $query_array=execSQL($con,"SELECT r.id,r.name,a.id as a_id FROM analysis a, rhead r where rhead_id=r.id and ahead_id=? order by r.name",array("i",$parentid),false);

    foreach($query_array as $key => $val) {
        $data[]=array(
            'item_id' => $val['id'],
            'project_id' => $prjid,
            'item' => $val['name'],
            'status' => $status,
            'leaf' => true,
            'id' => $val['name'].$val['a_id'],
            'expanded' => true,
            'iconCls' => 'folder'
            );
    }
    return $data;
}


if($_REQUEST['node']=='root') {
    $child=array();
    $openid=0;
    if(isset($_REQUEST['openid']) && intVal($_REQUEST['openid'])!=0) {
        $openid=intVal($_REQUEST['openid']);
    }

    //$query_array=execSQL($con,"SELECT * FROM ahead where project_id=?",array("i",$prjid),false);

    $query_array=execSQL($con,"SELECT a1.id,a1.name,IF(a1.status=0,IF(IFNULL(count(a2.ahead_id),0)>0,1,0),a1.status) as status,a1.atype_id,a1.project_id
    FROM ahead a1 left join analysis a2 on (a1.id=a2.ahead_id)
    where project_id=? group by a1.id",array("i",$prjid),false);

    if($query_array!=0)
        foreach($query_array as $key => $val) {
            if($openid!=$val['id']){
                $data[]=array(
                    'item_id' => $val['id'],
                    'atype_id' => $val['atype_id'],
                    'project_id' => $prjid,
                    'status' => $val['status'],
                    'item' => $val['name'],
                    'leaf' => false,
                    'id' => $val['id'],
                    'expanded' => false,
                    'iconCls' => 'folder-into'
                    );
            } else {
                $data[]=array(
                    'item_id' => $val['id'],
                    'atype_id' => $val['atype_id'],
                    'project_id' => $prjid,
                    'item' => $val['name'],
                    'status' => $val['status'],
                    'leaf' => false,
                    'id' => $val['id'],
                    'expanded' => true,
                    'iconCls' => 'folder-into',
                    'data' => get_by_id($openid,$prjid,$val['status'])
                    );
            }
        }
} else {
    if(!isset($_REQUEST['node']) || intVal($_REQUEST['node'])==0)
        $res->print_error("Not enough arguments.");
    $parentid=intVal($_REQUEST['node']);

    $query_array=execSQL($con,"SELECT * FROM ahead where id=?",array("i",$parentid),false);
    $status=$query_array[0]['status'];

    $data=get_by_id($parentid,$prjid,$status);


}
$con->close();

//logmsg(print_r($data,true));
//logmsg(print_r($val,true));

echo json_encode(array(
                     'text' => '.',
                     'data' => $data));

?>
