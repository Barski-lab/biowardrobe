<?php

   require("common.php");
   require_once('response.php');
   require_once('def_vars.php');
   require_once('database_connection.php');

//logmsg(__FILE__);
try {
    $data = json_decode(file_get_contents('php://input'));
}  catch(Exception $e) {
    $res->print_error("Cant read input".$e);
}

$count=0;

if( !isset($data->ahead_id) || !isset($data->filters) ) {
    $res->print_error("no data");
}

$con=def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

$namelist=array();
$namelistq="";
array_push($namelist,"");

foreach( $data->filters as $k1 => $val ) {
    if(!isset($val->name) || !isset($val->conditions))
        $res->print_error("no data");

    $count++;

    $namelistq=$namelistq."?,";
    $namelist[0]=$namelist[0]."s";
    array_push($namelist,$val->name);

    execSQL($con,"delete from `filter` where fhead_id in (select id from fhead where ahead_id=? and `name` like ? and analysis_id is NULL);",
        array("is",$data->ahead_id,$val->name),true);

    $id=execSQL($con,"select id from `fhead` where `name` like ? and ahead_id=? and analysis_id is NULL;",
        array("si",$val->name,$data->ahead_id),false);

    if($id!=0 && count($id)>1) {
        execSQL($con,"delete from `fhead` where `name` like ? and ahead_id=? and analysis_id is NULL;",
        array("si",$val->name,$data->ahead_id),true);
    }
    if($id==0 || count($id)==0) {
       execSQL($con,"insert into `fhead` (`name`,ahead_id) values(?,?);",
            array("si",$val->name,$data->ahead_id),true);
       $id=execSQL($con,"select LAST_INSERT_ID() as id;",array(),false);
    }

    foreach( $val->conditions as $k2 => $cond ) {
        execSQL($con,"insert into `filter` (operand,tbl,field,filter,value,fhead_id) values(?,?,?,?,?,?);",
              array("isiisi",$cond->operand,"",$cond->field,$cond->condition,$cond->value,$id[0]["id"]),true);
//            array("isiisi",$cond->operand,$cond->table,$cond->field,$cond->condition,$cond->value,$id[0]["id"]),true);
    }
}

$namelistq=rtrim($namelistq, ",");
$namelist[0]=$namelist[0]."i";
array_push($namelist,$data->ahead_id);
$r=execSQL($con,"delete from `fhead` where name not in(".$namelistq.") and ahead_id=? and analysis_id is NULL;",$namelist,true);

if(!$con->commit()) {
    $res->print_error("Cant commit");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
print_r($res->to_json());

?>
