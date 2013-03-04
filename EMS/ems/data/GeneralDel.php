<?php
   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

$AllowedTable=array("spikeins","spikeinslist","antibody","crosslink","experimenttype","fragmentation","genome","info");
$SpecialTable=array("labdata","grp_local");

$IDFIELD="id";
$IDFIELDTYPE="i";

if(!in_array($tablename,$AllowedTable)){
    if(!in_array($tablename,$SpecialTable)){
        $res->print_error('Table not in the list');
    } else {
        switch($tablename) {
        case "labdata":
            $res->print_error('Not implemented yet.');
//            $workerid=$_SESSION["user_id"];
//            if(!check_rights('labdata'))
//                if($where!="")
//                    $where=$where." and worker_id=$workerid ";
//                else
//                    $where=" where worker_id=$workerid ";
//            $con=def_connect();
//            $con->select_db($db_name_ems);
            break;
        case "grp_local":
            if(isset($_REQUEST['genomedb'])) {
                check_val($_REQUEST['genomedb']);
                $gdb=$_REQUEST['genomedb'];
            } else {
                $res->print_error('Not enough required parameters.');
            }

            $IDFIELD="name";
            $IDFIELDTYPE="s";
//            if(strrpos($gnm,$_SESSION["username"]) === false && !check_rights('delete'))
//                $res->print_error("Cant delete not owned records.");

//            if($where!="")
//                $where=$where." and name like '$gnm'";
//            else
//                $where=$where." where name like '$gnm'";
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


if(gettype($data)=="array") {
} else {
    $SQL_STR="delete from `$tablename` where $IDFIELD=?";

    if($IDFIELD=="id" && intVal($data->id)==0) {
        $res->print_error("no id");
    } else {
    $PARAMS=array("$IDFIELDTYPE",intVal($data->id));
    }
}

if(execSQL($con,$SQL_STR,$PARAMS,true)!=0) {
    $res->success = true;
    $res->message = "Data has been deleted";
    print_r($res->to_json());
    exit();
}


//$query_array=execSQL($con,"SELECT * FROM `$tablename` $where $order $limit",array(),false);
//$con->close();

$res->success = false;
$res->message = "Data can not be deleted";
print_r($res->to_json());
?>
