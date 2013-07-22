<?php
require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));

$tablename='labdata';

if(isset($_REQUEST['workerid'])) {
    $workerid = intVal($_REQUEST['workerid']);
}
else
    $workerid=$_SESSION["user_id"];

$cond="";

if(isset($_REQUEST['isrna']) && intVal($_REQUEST['isrna'])==1) {
    $cond=" and libstatus > 20 and experimenttype_id between 3 and 6 ";
} else {
    $cond=" and libstatus > 11 and experimenttype_id between 1 and 2 ";
}

if($workerid != 0) {
    $where=$where." and worker_id=$workerid ";
}


$query="%";
if(isset($_REQUEST['query'])) {
    $query=$_REQUEST['query'];
    if(!preg_match('/^[a-zA-Z0-9\ ]+$/', $query))
        $res->print_error('Incorrect required parameters.');

    $query='%'.$query.'%';
//    if (strpos($query, ' ') !== FALSE) {
//    }
}



$con=def_connect();
$con->select_db($db_name_ems);


$where=$where.$cond;

if(execSQL($con,"describe `$tablename`",array(),true)==0) {
    $res->print_error("Cant describe");
}

if(! ($totalquery = $con->query("SELECT COUNT(*) FROM `$tablename` $where")) ) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$row=$totalquery->fetch_row();
$total=$row[0];
$totalquery->close();
$query_array=execSQL($con,"SELECT * FROM `$tablename` $where and (cells like ? or conditions like ? or name4browser like ?) $order $limit",array("sss",$query,$query,$query),false);
$con->close();

$res->success = true;
$res->message = "Data loaded";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());
?>
