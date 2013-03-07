<?php
   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

$AllowedTable=array("spikeins","spikeinslist","antibody","crosslink","experimenttype","fragmentation","genome","info","rtype");
$SpecialTable=array("labdata","grp_local","project");

if(!in_array($tablename,$AllowedTable)) {
    if(!in_array($tablename,$SpecialTable)) {
        $res->print_error('Table not in the list');
    } else {
        switch($tablename) {
        case "project":
        case "labdata":
            if(isset($_REQUEST['workerid']))
                $workerid = intVal($_REQUEST['workerid']);
            else
                $res->print_error('Not enough required parameters.');
            if(isset($_REQUEST['typeid'])) {
                $typeid = intVal($_REQUEST['typeid']);
                $cond="";
                if($typeid>=1 && $typeid<=3)
                    $cond=" libstatus > 20 and experimenttype_id between 3 and 6 ";
                if($typeid==4)
                    $cond=" libstatus > 11 and experimenttype_id between 1 and 2 ";
                if($cond != "") {
                if($where!= "")
                    $where=$where." and ".$cond;
                else
                    $where=" where $cond";
                } else {
                    $res->print_error('Not yet supported.');
                }
            }
            if($workerid != 0) {
                if($where != "")
                    $where=$where." and worker_id=$workerid ";
                else
                    $where=" where worker_id=$workerid ";
            }
            $con=def_connect();
            $con->select_db($db_name_ems);
            break;
        case "grp_local":
            if(isset($_REQUEST['genomedb']) && isset($_REQUEST['genomenm'])) {
                check_val($_REQUEST['genomedb']);
                if($_REQUEST['genomenm']!="") check_val($_REQUEST['genomenm']);
                $gdb=$_REQUEST['genomedb'];
                $gnm=$_REQUEST['genomenm'];
            } else {
                $res->print_error('Not enough required parameters.');
            }
            if($where!="")
                $where=$where." and name like '$gnm%'";
            else
                $where=$where." where name like '$gnm%'";
            $con = new mysqli($db_host_gb,$db_user_gb,$db_pass_gb);
            if ($con->connect_errno)
                $res->print_error('Could not connect: ' . $con->connect_error);
            if(!$con->select_db($gdb)) {
                $res->print_error('Could not select db: ' . $con->connect_error);
            }
            break;
        }
    }
} else {
    $con=def_connect();
    $con->select_db($db_name_ems);
}


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
