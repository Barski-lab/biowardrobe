<?php

require_once('../auth.php');

   require("common.php");
   require_once('response.php');
   require_once('def_vars.php');
   require_once('database_connection.php');

$data=json_decode($_REQUEST['data']);

if(!isset($data))
$res->print_error("no data");

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));


$count=1;

if(gettype($data)=="array") {
    $res->print_error("Not supported yet.");
}



$con=def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

//$data->id;//] => 0
//$data->name; //] => PCA1_result
//$data->description;//] => PCA1_result
//$data->rtype_id;//] => 0
//$data->atype_id;//] => 2
//$data->ahead_id;//] => 1
//$data->labdata_id;//] => 0
//$data->project_id;//] => 1

$rnd=mt_rand();
$tablename="result_".ereg_replace("[^A-Za-z]", "", $data->name)."_".intVal($data->ahead_id)."_$rnd";
$status=1;
switch($data->atype_id) {
    case 1:
        exec("Rscript deseq.R $db_user $db_pass $db_name_experiments $db_host $data->ahead_id $tablename",$output,$retval);
        if($retval!=0)
            $res->print_error("Cant execute R");
            $status=2;
        break;
    case 2:
        exec("Rscript PCA.R $db_user $db_pass $db_name_experiments $db_host $data->ahead_id $tablename",$output,$retval);
        if($retval!=0)
            $res->print_error("Cant execute R");

        $status=2;
        break;
    case 4:
        $aid=$data->ahead_id;
        $command="/usr/local/bin/averagedensity -avd_aid=$aid -sql_table=\"$tablename\" -sql_host=localhost -sql_user=\"$db_user\" -sql_pass=\"$db_pass\" -sql_dbname=\"$db_name_ems\" -sam_twicechr=\"chrX chrY\" -sam_ignorechr=\"chrM\" -avd_window=5000 -avd_smooth=50 -log=\"/tmp/AverageTagDensity.log\"";
        //-plot_ext="svg" -gnuplot="/usr/local/bin/gnuplot"
        exec("$command",$output,$retval);
        if($retval!=0)
            $res->print_error("Cant execute averagedensity command");

        $status=2;

        break;
     default:
        $res->print_error("Not supported");
        break;
    }

if(execSQL($con,"insert into result(name,description,tableName,ahead_id,atype_id,project_id)
   values(?,?,?,?,?,?)",array("sssiii",$data->name,$data->description,$tablename,$data->ahead_id,$data->atype_id,$data->project_id),true)==0) {
   $res->print_error("Cant insert");
}

if(execSQL($con,"update ahead set status=? where id=?",array("ii",$status,$data->ahead_id),true)==0) {
    $res->print_error("Cant update");
}

if(!$con->commit()) {
    $res->print_error("Cant commit");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
//$res->data = $query_array;
print_r($res->to_json());

?>
