<?php
require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));
logmsg(print_r($data,true));

if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters. t');

$data = json_decode($_REQUEST['data']);

if (!isset($data))
    $res->print_error("no data");

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "genome", "info",
    "labdata", "grp_local",);

$IDFIELD = "id";
$IDFIELDTYPE = "i";

if (!in_array($tablename, $AllowedTable)) {
    $res->print_error('Table not in the list');
} else {
    switch ($tablename) {
        case "grp_local":

            if (isset($_REQUEST['genomedb']) && isset($_REQUEST['genomenm'])) {
                check_val($_REQUEST['genomedb']);
                $gdb = $_REQUEST['genomedb'];
            } else {
                $res->print_error('Not enough required parameters.');
            }

            $con = new mysqli($db_host_gb, $db_user_gb, $db_pass_gb);
            if ($con->connect_errno)
                $res->print_error('Could not connect: ' . $con->connect_error);
            if (!$con->select_db($gdb))
                $res->print_error('Could not select db: ' . $con->connect_error);

            break;
        default:
            $con = def_connect();
            $con->select_db($db_name_ems);
            break;
    }
}
$total = 1;

$con->autocommit(FALSE);

if (($table = execSQL($con, "describe `$tablename`", array(), false)) == 0) {
    $res->print_error("Cant describe");
}
$types = array();
foreach ($table as $dummy => $val) {
    $t = "s";
    if (strrpos($val["Type"], "int") !== false)
        $t = "i";
    elseif (strrpos($val["Type"], "float") !== false)
        $t = "d";
    elseif (strrpos($val["Type"], "double") !== false)
        $t = "d";
    elseif (strrpos($val["Type"], "date") !== false)
        $t = "dd";

    $types[$val["Field"]] = $t;
}

function insert_data($val)
{
    $PARAMS[] = "";
    $VARIABLES = "";

    $SQL_STR = "";
    global $con, $tablename, $types,$res;

    foreach ($val as $f => $d) {
        if(!array_key_exists($f,$types))
            $res->print_error("Table field does not exist $f");

        if ($f=="worker_id" && intVal($d)!=$_SESSION["user_id"] && !check_rights())
            $res->print_error("Insufficient credentials");

        if (strrpos($f, "_id") !== false && intVal($d) == 0) {
            $SQL_STR = $SQL_STR . " $f,";
            $VARIABLES = $VARIABLES . "null,";
            continue;
        }

        $SQL_STR = $SQL_STR . " $f,";
        $VARIABLES = $VARIABLES . "?,";

        if ($f == "id" && $types[$f] == "s" && strlen($d)!=36) {
            $PARAMS[] = guid();
            $PARAMS[0] = $PARAMS[0] . $types[$f];
        }
        elseif ($types[$f] == "dd") {
            $date = DateTime::createFromFormat('m/d/Y', $d);
            $PARAMS[] = $date->format('Y-m-d');
            $PARAMS[0] = $PARAMS[0] . "s";
        } else {
            $PARAMS[] = $d;
            $PARAMS[0] = $PARAMS[0] . $types[$f];
        }
    }

    $SQL_STR = substr_replace($SQL_STR, "", -1);
    $VARIABLES = substr_replace($VARIABLES, "", -1);

    $SQL_STR = "insert into `$tablename` ($SQL_STR) VALUES($VARIABLES)";

    execSQL($con, $SQL_STR, $PARAMS, true);
}

if (gettype($data) == "array") {
    foreach ($data as $key => $val) {
        insert_data($val);
    }
    $count = count($data);
} else {
    insert_data($data);
}

if (!$con->commit()) {
    $res->print_error("Cant insert");
}

$con->close();

$res->success = true;
$res->message = "Data inserted";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());
?>
