<?php
   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters. t');

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

$AllowedTable=array("spikeins","spikeinslist","antibody","crosslink","experimenttype","fragmentation","genome","info","rtype","atype","result");
$SpecialTable=array("labdata","grp_local","project");

$IDFIELD="id";
$IDFIELDTYPE="i";

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
                $res->print_error('Not enough required parameters. w');
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

            $IDFIELD="name";
            $IDFIELDTYPE="s";

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
$total=1;

$con->autocommit(FALSE);

if(($table=execSQL($con,"describe `$tablename`",array(),false))==0) {
    $res->print_error("Cant describe");
}
$types=array();
foreach($table as $xxx => $val) {
    $t="s";
    if(strrpos($val["Type"],"int")!==false)
        $t="i";
    if(strrpos($val["Type"],"float")!==false)
        $t="d";
    if(strrpos($val["Type"],"double")!==false)
        $t="d";
    if(strrpos($val["Type"],"date")!==false)
        $t="dd";

    $types[$val["Field"]]=$t;
}

function update_data ($val) {
    $PARAMS[]="";
    $SQL_STR="";
    global $IDFIELD,$IDFIELDTYPE,$con,$tablename,$types;
    foreach($val as $f => $d) {
        if($f==$IDFIELD) {
            $id=$d;
            continue;
        }
        if(strrpos($f,"_id")!==false && intVal($d)==0) {
            $SQL_STR=$SQL_STR." $f=null,";
            continue;
        }
        $SQL_STR=$SQL_STR." $f=?,";

        if($types[$f]=="dd") {
            $date = DateTime::createFromFormat('m/d/Y', $d);
            $PARAMS[] = $date->format('Y-m-d');
            $PARAMS[0]=$PARAMS[0]."s";
        } else {
            $PARAMS[] = $d;
            $PARAMS[0]=$PARAMS[0].$types[$f];
        }
    }

    $PARAMS[]=$id;
    $PARAMS[0]=$PARAMS[0].$IDFIELDTYPE;

    $SQL_STR = substr_replace($SQL_STR ,"",-1);
    $SQL_STR = "update `$tablename` set $SQL_STR where $IDFIELD=?";

    execSQL($con,$SQL_STR,$PARAMS,true);
}

if(gettype($data)=="array") {
    foreach($data as $key => $val ) {
        update_data($val);
    }
    $count=count($data);
} else {
    update_data($data);
}

if(!$con->commit()) {
    $res->print_error("Cant insert");
}

$con->close();

$res->success = true;
$res->message = "Data updated";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());
?>
