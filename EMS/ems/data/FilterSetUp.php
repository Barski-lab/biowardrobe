<?php

   require("common.php");
   require_once('response.php');
   require_once('def_vars.php');
   require_once('database_connection.php');

logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
try {
    $data = json_decode(file_get_contents('php://input'));
    logmsg(print_r($data,true));
}  catch(Exception $e) {
    $res->print_error("Cant read input".$e);
}


$count=1;
/*
foreach( $_REQUEST as $key => $val ) {
if($val == null ) continue;
if(strpos($key,"name") === false ) continue;

            $fk=$val;
            if(
            !isset($_REQUEST[$fk.'_field']) ||
            !isset($_REQUEST[$fk.'_condition']) ||
            !isset($_REQUEST[$fk.'_value'])
            )
            $res->print_error("no data");
            }

$con=def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

                execSQL($con,"delete from `condition` where ahead_id=? and analysis_id is NULL;",array("i",$_REQUEST['ahead_id']),true);

            foreach( $_REQUEST as $key => $val ) {
            if($val == null ) continue;
            if(strpos($key,"name") === false ) continue;

                $fk=$val;
                $field=$_REQUEST[$fk.'_field'];
                $condition=$_REQUEST[$fk.'_condition'];
                $value=$_REQUEST[$fk.'_value'];

                if(execSQL($con,"insert into `condition` (name,field,filter,value,ahead_id)
                values(?,?,?,?,?);",array("siidi",$fk,$field,$condition,$value,$_REQUEST['ahead_id']),true)==0) {
                $res->print_error("Cant insert");
                }

            }

if(!$con->commit()) {
$res->print_error("Cant commit");
}

$con->close();
*/
$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
print_r($res->to_json());

?>
