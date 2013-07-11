<?php

   require("common.php");
   require_once('response.php');
   require_once('def_vars.php');
   require_once('database_connection.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));

if(!isset($_REQUEST["ahead_id"])) {
    $res->print_error("no data");
}

$count=0;

$con=def_connect();
$con->select_db($db_name_ems);

$heads=execSQL($con,"select * from fhead where ahead_id=? and analysis_id is NULL;",array("i",$_REQUEST['ahead_id']),false);

$response=array();

if(count($heads)>0)
foreach( $heads as $key => $val ) {
    $count++;
    //logmsg(print_r($val,true));
    $filters=execSQL($con,"select * from filter where fhead_id=?;",array("i",$val['id']),false);
    $filter=array();
    foreach( $filters as $k => $v ) {
        array_push($filter,array(
        'operand'=>$v['operand'],
        'table'=>$v['tbl'],
        'field'=>$v['field'],
        'condition'=>$v['filter'],
        'value'=>$v['value']
        ));
    }
    array_push($response,array('name'=>$val['name'],'conditions'=>$filter));
}

$con->close();

$res->success = ($count>0);
$res->message = "Data loaded";
$res->total = $count;
$res->data=$response;
print_r($res->to_json());

?>
