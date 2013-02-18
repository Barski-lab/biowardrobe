<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

$con->select_db($db_name_experiments);

if (!($stmt = $con->prepare("describe `$tablename`"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}

if (!$stmt->execute()) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$result = $stmt->get_result();
$TYPE=array();
$HEAD=array();
while($row=$result->fetch_assoc())
  {
   $TYPE[$row['Field']]=$row['Type'];
   $HEAD[$row['Field']]=$row['Field'];
  }
$stmt->close();


if (!($stmt = $con->prepare("SELECT * FROM `$tablename`"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}

if (!($stmt->execute())) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}

$result = $stmt->get_result();

header("Content-type: text/csv");
header("Content-Disposition: attachment; filename=$tablename.csv");
header("Pragma: no-cache");
header("Expires: 0");


$i=0;
$outstream = fopen("php://output", 'w');
fputcsv($outstream, $HEAD,',','"');

while($row=$result->fetch_assoc())
  {
    $RPKM = array();
    foreach($TYPE as $key => $val) {
            if($val == 'float')
                $RPKM[$key] = round($row[$key],2);
            else
                $RPKM[$key] = $row[$key];
    }
    fputcsv($outstream, $RPKM,',','"');
    $i++;
  }

$stmt->close();
$con->close();
$outstream->close();
?>
