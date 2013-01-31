<?php

//Import Response Class
require_once('response.php');
//Make DB connection
require_once('database_connection.php');

$con->select_db($db_name_experiments);

$res = new Response();


logmsg(print_r($_REQUEST,true));

function check_val($val) {
if(!preg_match('/^[a-zA-Z0-9-_]+$/', $val))
    $res->print_error('Incorrect required parameters.');
}

if(isset($_REQUEST['start']))
    $offset = $_REQUEST['start'];
else
    $offset = 0;

if(isset($_REQUEST['limit']))
    $limit = $_REQUEST['limit'];
else
    $limit = 30;

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

check_val($tablename);

if(isset($_REQUEST['sort']))
    $sort = json_decode($_REQUEST['sort']);

$order="";
if(isset($sort)) {
$order="order by ";
    foreach($sort as $val) {
     check_val($val->property);
     check_val($val->direction);
     $order=$order."$val->property $val->direction,";
    }
$order=substr($order,0,-1);
}



if(isset($_REQUEST['filter']))
    $filter = json_decode($_REQUEST['filter']);

$where="";
if(isset($filter)) {
$where="where ";
    foreach($filter as $val) {
     check_val($val->type);
     //check_val($val->comparision);
     check_val($val->value);
     check_val($val->field);
     if($val->type == 'string') {
        $where=$where." $val->field like '%$val->value%' and";
     }
     if($val->type == 'numeric') {
        if($val->comparison == 'lt') {
            $where=$where." $val->field <= $val->value and";
        }
        if($val->comparison == 'gt') {
            $where=$where." $val->field >= $val->value and";
        }
     }
     logmsg($where);
    }
$where=substr($where,0,-3);
}

//[filter] => [{"type":"numeric","comparison":"lt","value":1,"field":"RPKM_0"},{"type":"numeric","comparison":"gt","value":1,"field":"RPKM_0"}]
//[filter] => [{"type":"string","value":"NM_","field":"refsec_id"}]

if (!($stmt = $con->prepare("describe `$tablename`"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}

if (!$stmt->execute()) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$stmt->close();

if(! ($totalquery = $con->query("SELECT COUNT(*) FROM `$tablename` $where")) ) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$row=$totalquery->fetch_row();
$total=$row[0];
$totalquery->close();

logmsg("SELECT * FROM `$tablename` $order LIMIT $offset,$limit");

if (!($stmt = $con->prepare("SELECT * FROM `$tablename` $where $order LIMIT $offset,$limit"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}

if (!($stmt->execute())) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}

$result = $stmt->get_result();
//$row = $res->fetch_assoc();

$query_array=array();


$i=0;
//Iterate all Select
while($row=$result->fetch_assoc())
  {
    //Create New User instance
    $RPKM = array(
    'refsec_id' => $row['refsec_id'],
    'gene_id' => $row['gene_id'],
    'chrom' => $row['chrom'],
    'txStart' => $row['txStart'],
    'txEnd' => $row['txEnd'],
    'strand' => $row['strand'],
    'RPKM_0' => round($row['RPKM_0'],2)
    );
    $query_array[$i]=$RPKM;
    $i++;
  }
$stmt->close();
$con->close();
//Creating Json Array needed for Extjs Proxy
$res->success = true;
$res->message = "Data loaded";
$res->total = $total;
$res->data = $query_array;
//Printing json ARRAY
print_r($res->to_json());

?>