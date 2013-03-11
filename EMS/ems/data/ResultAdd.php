<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode(stripslashes($_REQUEST['data']));

if(!isset($data))
    $res->print_error("no data");

logmsg('add result');
logmsg(print_r($_REQUEST,true));
logmsg(print_r($data,true));


$count=1;

if(gettype($data)=="array") {
    $res->print_error("Not supported yet.");
}



$con=def_connect();
$con->select_db($db_name_ems);

$data->id;//] => 0
$data->name; //] => PCA1_result
$data->description;//] => PCA1_result
$data->rtype_id;//] => 0
$data->atype_id;//] => 2
$data->ahead_id;//] => 1
$data->labdata_id;//] => 0
$data->project_id;//] => 1

switch($data->atype_id) {
case 2:

    $rnd=mt_rand();
    $tablename="result_".ereg_replace("[^A-Za-z]", "", $data->name)."_$rnd";
    exec("Rscript PCA.R $db_user $db_pass $db_name_experiments $db_host $data->ahead_id $tablename",$output,$retval);
    if($retval!=0)
        $res->print_error("Cant execute R");

    if(execSQL($con,"insert into result(name,description,tableName,ahead_id,atype_id,project_id)
                        values(?,?,?,?,?,?)",array("sssiii",$data->name,$data->description,$tablename,$data->ahead_id,$data->atype_id,$data->project_id),true)==0) {
        $res->print_error("Cant insert");
    }
    if(execSQL($con,"update ahead set status=1 where id=?",array("i",$data->ahead_id),true)==0) {
        $res->print_error("Cant update");
    }

    break;
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
//$res->data = $query_array;
print_r($res->to_json());

?>
