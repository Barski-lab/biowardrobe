<?php
require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));

//*****************************************************************
function delete_data($val)
{
    $PARAMS[] = "";
    $SQL_STR = "";
    global $IDFIELD, $IDFIELDTYPE, $con, $tablename, $types,$res,$_SESSION;

    if(!execSQL($con, "delete from `$tablename` where $IDFIELD=?", array($IDFIELDTYPE,$val->$IDFIELD), true))
        $res->print_error("Cant delete");
}
//*****************************************************************



if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

$data = json_decode(stripslashes($_REQUEST['data']));

if (!isset($data))
    $res->print_error("no data");

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "genome",
    "grp_local");
//$SpecialTable=array("labdata","grp_local");

$IDFIELD = 'id';
$IDFIELDTYPE = "i";

if (!in_array($tablename, $AllowedTable)) {
        $res->print_error('Table not in the list');
    } else {
        switch ($tablename) {
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
                if (isset($_REQUEST['genomedb'])) {
                    check_val($_REQUEST['genomedb']);
                    $gdb = $_REQUEST['genomedb'];
                } else {
                    $res->print_error('Not enough required parameters.');
                }

                $IDFIELD = 'name';
                $IDFIELDTYPE = "s";

                $con = new mysqli($db_host_gb, $db_user_gb, $db_pass_gb);
                if ($con->connect_errno)
                    $res->print_error('Could not connect: ' . $con->connect_error);
                if (!$con->select_db($gdb)) {
                    $res->print_error('Could not select db: ' . $con->connect_error);
                }
                break;
            default:
                $con = def_connect();
                $con->select_db($db_name_ems);
                break;
        }
}
$con->autocommit(FALSE);
$total=-1;

if (gettype($data) == "array") {
    foreach ($data as $key => $val) {
        delete_data($val);
    }
    $count = count($data);
} else {
    delete_data($data);
}

if (!$con->commit()) {
    $res->print_error("Cant update");
}

$con->close();

$res->success = true;
$res->message = "Data updated";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());
?>
