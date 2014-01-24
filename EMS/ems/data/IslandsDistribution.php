<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST, true));

if (isset($_REQUEST['labdata_id']))
    $labdata_id = $_REQUEST['labdata_id'];
else
    $res->print_error('Not enough required parameters.');

$con = def_connect();
$con->select_db($db_name_ems);


$query_array = execSQL($con, "SELECT name4browser from labdata where id=?", array("i", $labdata_id), false);
$filename = $query_array[0]['name4browser'];

if ($filename == "")
    $res->print_error('Cant find file name');

$query_array = array();

exec("Rscript islands_distribution.R $labdata_id", $output);

$DATA = array(
    'name' => $filename,
    'Upstream' => intval($output[0]),
    'Promoter' => intval($output[1]),
    'Exon' => intval($output[2]),
    'Intron' => intval($output[3]),
    'Intergenic' => intval($output[4])
);

$con->close();


$fields = array(
    array(
        "name" => "name",
        "type" => "string"
    ),
    array(
        "name" => "Upstream",
        "type" => "int"
    ),
    array(
        "name" => "Promoter",
        "type" => "int"
    ),
    array(
        "name" => "Exon",
        "type" => "int"
    ),
    array(
        "name" => "Intron",
        "type" => "int"
    ),
    array(
        "name" => "Intergenic",
        "type" => "int"
    ),
);



$res->success = true;
$res->message = "Data loaded";
$res->total = sizeof($DATA);
$res->meta = array("fields" => $fields);
$res->data = $DATA;
print_r($res->to_json());
?>

