<?php

$res = new Response();

function check_val($val) {
if(!preg_match('/^[a-zA-Z0-9-_]+$/', $val))
    $res->print_error('Incorrect required parameters.');
}

if(isset($_REQUEST['start']))
    $offset = intval($_REQUEST['start']);
else
    $offset = 0;

if(isset($_REQUEST['limit']))
    $limit = intval($_REQUEST['limit']);
else
    $limit = 0;

if(isset($_REQUEST['sort']))
    $sort = json_decode($_REQUEST['sort']);

$order="";
if(isset($sort)) {
$order="order by ";
    foreach($sort as $val) {
     check_val($val->property);
     check_val($val->direction);
     $order=$order."$val->property $val->direction,";
    }
$order=substr($order,0,-1);
}



if(isset($_REQUEST['filter']))
    $filter = json_decode($_REQUEST['filter']);

$where="";
if(isset($filter)) {
$where="where ";
    foreach($filter as $val) {
     check_val($val->type);
     //check_val($val->comparision);
     check_val($val->value);
     check_val($val->field);
     if($val->type == 'string') {
        $where=$where." $val->field like '%$val->value%' and";
     }
     if($val->type == 'numeric') {
        if($val->comparison == 'lt') {
            $where=$where." $val->field <= $val->value and";
        }
        if($val->comparison == 'gt') {
            $where=$where." $val->field >= $val->value and";
        }
        if($val->comparison == 'eq') {
            $where=$where." $val->field = $val->value and";
        }
     }
     logmsg($where);
    }
$where=substr($where,0,-3);
}

?>
