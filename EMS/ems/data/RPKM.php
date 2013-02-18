<?php

//Import Response Class
require_once('response.php');


require_once('def_vars.php');

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

check_val($tablename);

require_once('database_connection.php');


$con->select_db($db_name_experiments);



//logmsg(print_r($_REQUEST,true));


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

//logmsg("SELECT * FROM `$tablename` $order LIMIT $offset,$limit");

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
    'TOT_R_0' => $row['TOT_R_0'],
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