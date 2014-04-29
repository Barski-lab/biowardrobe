<?php

require_once('../settings.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

check_val($tablename);

$con=$settings->connection;
$con->select_db($settings->settings['experimentsdb']['value']);

if(execSQL($con,"describe `$tablename`",array(),true)==0) {
       $res->print_error("Cant describe");
}

if(! ($totalquery = $con->query("SELECT COUNT(*) FROM `$tablename`")) ) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$row=$totalquery->fetch_row();
$total=$row[0];
$totalquery->close();


$query_array=selectSQL("SELECT * FROM `$tablename`",array());
$con->close();

//logmsg(print_r($query_array,true));

$fields=array();

foreach($query_array[0] as $key => $val) {
 $type="float";
 if($key=="X") $type="int";
 array_push($fields,array(
    "name"=>$key,
     "type"=>$type
     ));
}

$res->meta=array( "fields"=>$fields );

$res->success = true;
$res->message = "Data loaded";
$res->total = sizeof($query_array);
$res->data = $query_array;
print_r($res->to_json());
?>

