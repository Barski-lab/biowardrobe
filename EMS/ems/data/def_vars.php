<?php

   function check_val($val) {
       global $res;
       if(!preg_match('/^[a-zA-Z0-9-_]+$/', $val))
           $res->print_error('Incorrect required parameters.');
   }

if(isset($_REQUEST['start']))
    $offset = intval($_REQUEST['start']);
else
    $offset = 0;

if(isset($_REQUEST['limit']))
    $llimit = intval($_REQUEST['limit']);
else
    $llimit = 0;

$limit="";
if($offset >0 || $llimit > 0) {
    $limit=" LIMIT $offset,$llimit ";
}

if(isset($_REQUEST['sort']))
    $sort = json_decode($_REQUEST['sort']);

$order="";
if(isset($sort)) {
    $order="order by ";
    foreach($sort as $val) {
        check_val($val->property);
        if($val->direction=="ASC" || $val->direction=="DESC")
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
        //logmsg($where);
    }
    $where=substr($where,0,-3);
}

?>
