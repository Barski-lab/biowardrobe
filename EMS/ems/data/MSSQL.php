<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$con=def_mssql_connect();

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

$SpecialTable=array("tblDemoEGID","tblSamples");

    if(!in_array($tablename,$SpecialTable)){
        $res->print_error('Table not in the list');
    }



if(! ($totalquery = mssql_query("SELECT COUNT(*) FROM $tablename $where")) ) {
    $res->print_error("Select feild");
}


$row=mssql_fetch_array($totalquery);
$total=$row[0];
mssql_free_result($totalquery);





$query = mssql_query("SELECT * from $tablename $where $order $limit");

$query_array=array();
while( ($row = mssql_fetch_assoc($query)) ){
    $query_array[]=$row;
}

mssql_close();

$res->success = true;
$res->message = "Data loaded";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());
?>
