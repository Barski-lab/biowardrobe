<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));

if (isset($_REQUEST['id']))
    $id = $_REQUEST['id'];
else
    $res->print_error('Not enough required parameters.');

check_val($id);

$con = def_connect();
$con->select_db($db_name_experiments);

$record = get_table_info($id);
if (!$record)
    $res->print_error("no tablename data");

$tablename = $record[0]['tableName'];
$gblink = $record[0]['gblink'];
$db=$record[0]['db'];
logmsg(print_r($record,true));


if (!($totalquery = execSQL($con, "SELECT COUNT(*) as count FROM `$tablename` $where", array(), false, 0))) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
//$row=$totalquery->fetch_row();
$total = $totalquery[0]['count']; //$row[0];
//$totalquery->close();


if (($descr = execSQL($con, "describe `$tablename`", array(), false)) == 0) {
    $res->print_error("Cant describe");
}

//logmsg(print_r($descr, true));

$fields = array();

foreach ($descr as $key => $val) {
    $type = "float";
    if (strpos($val['Type'], "int") !== false) $type = "int";
    elseif (strpos($val['Type'], "float") !== false) $type = "float";
    elseif (strpos($val['Type'], "varchar") !== false) $type = "string";
    else $type = "string";

    array_push($fields, array(
        "name" => $val['Field'],
        "type" => $type
    ));
}

//logmsg(print_r($fields, true));


$query_array = execSQL($con, "SELECT * FROM `$tablename` $where $order $limit", array(), false, 0);
$con->close();

//logmsg(print_r($query_array,true));

$res->success = true;
$res->message = "Data loaded";
$res->extra = array("gblink"=>"db=$db&$gblink");
$res->total = $total;
$res->meta = array("fields" => $fields);
$res->data = $query_array;
print_r($res->to_json());
?>

