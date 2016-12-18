<?php
require_once('../auth.php');

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

if(! ($totalquery = $con->query("SELECT COUNT(*) FROM `$tablename` $where")) ) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$row=$totalquery->fetch_row();
$total=$row[0];
$totalquery->close();


$query_array=execSQL($con,"SELECT * FROM `$tablename` $where $order $limit",array(),false);
$con->close();

$res->success = true;
$res->message = "Data loaded";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());

?>
