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

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

check_val($tablename);


if (!($stmt = $con->prepare("describe `$tablename`"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}

if (!$stmt->execute()) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$stmt->close();

if (!($stmt = $con->prepare("SELECT * FROM `$tablename`"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}

if (!($stmt->execute())) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}

$result = $stmt->get_result();
//$row = $res->fetch_assoc();

header("Content-type: text/csv");
header("Content-Disposition: attachment; filename=$tablename.csv");
header("Pragma: no-cache");
header("Expires: 0");

$query_array=array();


$i=0;
$outstream = fopen("php://output", 'w');
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
    //$query_array[$i]=$RPKM;
    fputcsv($outstream, $RPKM,',','"');
    $i++;
  }
$stmt->close();
$con->close();
$outstream->close();
?>