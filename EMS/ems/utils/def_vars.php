<?php

function check_val($val) {
    global $response;
    if (!preg_match('/^[a-zA-Z0-9-_\ \/]+$/', $val))
        $response->print_error('Incorrect required parameters.');
}

if (isset($_REQUEST['start']))
    $offset = intval($_REQUEST['start']);
else
    $offset = 0;

if (isset($_REQUEST['limit']))
    $llimit = intval($_REQUEST['limit']);
else
    $llimit = 0;

$limit = "";
if ($offset > 0 || $llimit > 0) {
    $limit = " LIMIT $offset,$llimit ";
}

if (isset($_REQUEST['sort']))
    $sort = json_decode($_REQUEST['sort']);

function parse_sort_global($sort) {
    $order="";
    foreach ($sort as $val) {
        check_val($val->property);
        if ($val->direction == "ASC" || $val->direction == "DESC")
            $order = $order . "`$val->property` $val->direction,";
    }
    $order = substr($order, 0, -1);
    return $order;
}

$order = "";
if (isset($sort)) {
    $order = "order by ".parse_sort_global($sort);
}

function parse_where_global($filter) {
    $where="";
    foreach ($filter as $val) {
        check_val($val->type);
        check_val($val->field);
        if ($val->type == 'date') {
            if (!preg_match('/^[0-9\/]+$/', $val->value))
                $response->print_error('Incorrect required parameters.');
            if ($val->comparison == 'lt') {
                $where = $where . " and `$val->field` < str_to_date('$val->value','%m/%d/%Y') ";
            }
            if ($val->comparison == 'gt') {
                $where = $where . " and `$val->field` > str_to_date('$val->value','%m/%d/%Y') ";
            }
            if ($val->comparison == 'eq') {
                $where = $where . " and `$val->field` = str_to_date('$val->value','%m/%d/%Y') ";
            }
        }
        if ($val->type == 'string') {
            check_val($val->value);
            $where = $where . " and $val->field like '%$val->value%' ";
        }
        if ($val->type == 'numeric') {
            check_val($val->value);
            if ($val->comparison == 'lt') {
                $where = $where . " and $val->field <= $val->value ";
            }
            if ($val->comparison == 'gt') {
                $where = $where . " and $val->field >= $val->value ";
            }
            if ($val->comparison == 'eq') {
                $where = $where . " and $val->field = $val->value ";
            }
        }
        if ($val->type == 'list') {
            //check_val($val->value);
            $value = intVal($val->value);
            if (strstr($val->value, ',')) {
                $fi = explode(',', $val->value);
                for ($q = 0; $q < count($fi); $q++) {
                    $fi[$q] = intVal($fi[$q]);
                }
                $value = implode(',', $fi);
            }
            $where .= " AND " . $val->field . " IN (" . $value . ")";
        }
    }
    return $where;
}

$where = " where 0 = 0 ";
if (isset($_REQUEST['filter'])) {
    $filter = json_decode($_REQUEST['filter']);
    $where .= parse_where_global($filter);
}



?>
