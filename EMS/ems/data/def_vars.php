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

$where=" where 0 = 0 ";
if(isset($filter)) {

    foreach($filter as $val) {
        check_val($val->type);
        check_val($val->field);
        if($val->type == 'date') {
            if(!preg_match('/^[0-9\/]+$/', $val->value))
                $res->print_error('Incorrect required parameters.');
            if($val->comparison == 'lt') {
                $where=$where." and $val->field < str_to_date('$val->value','%m/%d/%Y') ";
            }
            if($val->comparison == 'gt') {
                $where=$where." and $val->field > str_to_date('$val->value','%m/%d/%Y') ";
            }
            if($val->comparison == 'eq') {
                $where=$where." and $val->field = str_to_date('$val->value','%m/%d/%Y') ";
            }
        }
        if($val->type == 'string') {
            check_val($val->value);
            $where=$where." and $val->field like '%$val->value%' ";
        }
        if($val->type == 'numeric') {
            check_val($val->value);
            if($val->comparison == 'lt') {
                $where=$where." and $val->field <= $val->value ";
            }
            if($val->comparison == 'gt') {
                $where=$where." and $val->field >= $val->value ";
            }
            if($val->comparison == 'eq') {
                $where=$where." and $val->field = $val->value ";
            }
        }
        //logmsg($where);
    }
}

?>
