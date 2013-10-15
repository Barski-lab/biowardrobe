<?php
require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST, true));
//logmsg(print_r($data,true));

//*****************************************************************
function update_data($val)
{
    $PARAMS[] = "";
    $SQL_STR = "";
    $libcode = false;
    global $IDFIELD, $IDFIELDTYPE, $con, $tablename, $types, $res, $_SESSION;
    foreach ($val as $f => $d) {

        if (!array_key_exists($f, $types))
            $res->print_error("Table field does not exist $f");

        if ($f == $IDFIELD) {
            $id = $d;
            continue;
        }

        if ($f == "worker_id" && intVal($d) != $_SESSION["user_id"] && !check_rights())
            $res->print_error("Insufficient credentials");

        if (strrpos($f, "_id") !== false && intVal($d) == 0) {
            $SQL_STR = $SQL_STR . " $f=null,";
            continue;
        }

        switch ($tablename) {
            case "labdata":

                if (strrpos($f, "libcode") !== false && strlen($d) != 0 && !$libcode) {
                    $libcode = true;
                    $SQL_STR = $SQL_STR . " url=?,";
                    $PARAMS[] = "";
                    $PARAMS[0] = $PARAMS[0] . "s";
                }

                if (strrpos($f, "url") !== false && strlen($d) != 0 && $libcode) {
                    continue;
                }
                if (strrpos($f, "url") !== false && strlen($d) != 0 && !$libcode) {
                    $libcode = true;
                    $SQL_STR = $SQL_STR . " libcode=?,";
                    $PARAMS[] = "";
                    $PARAMS[0] = $PARAMS[0] . "s";
                }
                break;
        }

        if (!$libcode) {
            $SQL_STR = $SQL_STR . " url=?,";
            $PARAMS[] = "";
            $PARAMS[0] = $PARAMS[0] . "s";
        }
        $SQL_STR = $SQL_STR . " $f=?,";

        if ($types[$f] == "dd") {
            $date = DateTime::createFromFormat('m/d/Y', $d);
            $PARAMS[] = $date->format('Y-m-d');
            $PARAMS[0] = $PARAMS[0] . "s";
        } else {
            $PARAMS[] = $d;
            $PARAMS[0] = $PARAMS[0] . $types[$f];
        }
    }

    $PARAMS[] = $id;
    $PARAMS[0] = $PARAMS[0] . $IDFIELDTYPE;

    $SQL_STR = substr_replace($SQL_STR, "", -1);
    $SQL_STR = "update `$tablename` set $SQL_STR where $IDFIELD=?";

    execSQL($con, $SQL_STR, $PARAMS, true);
}

//*****************************************************************
if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters. t');

$data = json_decode($_REQUEST['data']);

if (!isset($data))
    $res->print_error("no data");

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "genome", "info", "rtype", "atype", "result",
    "labdata", "grp_local", "project");

$IDFIELD = "id";
$IDFIELDTYPE = "i";

if (!in_array($tablename, $AllowedTable)) {
    $res->print_error('Table not in the list');
} else {
    switch ($tablename) {
        case "grp_local":

            $IDFIELD = "name";
            $IDFIELDTYPE = "s";

            if (isset($_REQUEST['genomedb'])) {
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
        $t = "d"; elseif (strrpos($val["Type"], "double") !== false)
        $t = "d"; elseif (strrpos($val["Type"], "date") !== false)
        $t = "dd";

    $types[$val["Field"]] = $t;
}

if (gettype($data) == "array") {
    foreach ($data as $key => $val) {
        update_data($val);
    }
    $count = count($data);
} else {
    update_data($data);
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
