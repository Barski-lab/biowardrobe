<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con=def_connect();
$con->select_db($db_name_ems);

//logmsg("ResultTree");
//logmsg(print_r($_REQUEST,true));

if(!isset($_REQUEST['projectid']))
    $res->print_error("Not enough arguments.");

$prjid=intVal($_REQUEST['projectid']);

$data=array();


function get_by_id ($parentid,$prjid) {
    global $con;
    $data=array();
    $query_array=execSQL($con,"SELECT re.id,re.name,re.description,re.rtype_id,labdata_id FROM result re, resultintersection r where result_id=re.id and rhead_id=? order by re.name",array("i",$parentid),false);
    if($query_array != 0)
        foreach($query_array as $key => $val) {
            $data[]=array(
                'item_id' => $val['id'],
                'project_id' => $prjid,
                'item' => $val['name'],
                'description' => $val['description'],
                'leaf' => true,
                'id' => $val['name'].$val['id'],
                'labdata_id' => $val['labdata_id'],
                'rtype_id' => $val['rtype_id']
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

    $query_array=execSQL($con,"select r.id,r.name,r.project_id,COALESCE(q.status, 0) as status from
rhead r left join
(select rhead_id,max(status) as status,project_id from analysis a,ahead ah
 where ahead_id=ah.id and project_id=?
  group by rhead_id) as q on
q.rhead_id=r.id and q.project_id=r.project_id
where r.project_id=?",array("ii",$prjid,$prjid),false);

//    $query_array=execSQL($con,"SELECT distinct r.id,r.name,r.project_id,COALESCE(ah.status, 0) as status FROM ems.rhead r
//    left join ems.analysis a on (r.id=a.rhead_id)
//    left join ems.ahead ah on a.ahead_id=ah.id where r.project_id=?",array("i",$prjid),false);
    if($query_array != 0)
        foreach($query_array as $key => $val) {
            if($openid!=$val['id']){
                $data[]=array(
                    'item_id' => $val['id'],
                    'project_id' => $prjid,
                    'item' => $val['name'],
                    'leaf' => false,
                    'id' => $val['id'],
                    'status' => $val['status'],
                    'expanded' => false,
                    'iconCls' => 'folder-into'
                    //'data' => get_by_id($val['id'],$prjid)
                    );
            } else {
                $data[]=array(
                    'item_id' => $val['id'],
                    'project_id' => $prjid,
                    'item' => $val['name'],
                    'leaf' => false,
                    'id' => $val['id'],
                    'status' => $val['status'],
                    'expanded' => true,
                    'iconCls' => 'folder-into',
                    'data' => get_by_id($openid,$prjid)
                    );
            }

        }
} else {
    if(!isset($_REQUEST['node']) || intVal($_REQUEST['node'])==0)
        $res->print_error("Not enough arguments.");
    $parentid=intVal($_REQUEST['node']);
    $data=get_by_id($parentid,$prjid);
}
$con->close();

//logmsg(print_r($data,true));
//logmsg(print_r($val,true));

echo json_encode(array(
                     'text' => '.',
                     'expanded' => true,
                     'data' => $data));

?>
