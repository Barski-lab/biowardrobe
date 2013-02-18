<?php

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['labdata_id']))
    $labdata_id = $_REQUEST['labdata_id'];
else
    $res->print_error('Not enough required parameters.');




$con->select_db($db_name_ems);



if(! ($fnameq = $con->prepare("SELECT filename from labdata where id=?")) ) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}

if(! $fnameq->bind_param("i",$labdata_id) ) {
    $res->print_error("Bind failed: (" . $con->errno . ") " . $con->error);
}
if(! $fnameq->execute() ) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}

$spikeins_id=1;
$fnameq->bind_result($tablename);
$fnameq->fetch();
$fnameq->close();

//logmsg("SELECT * FROM `$tablename` $order LIMIT $offset,$limit");

if (!($stmt = $con->prepare("SELECT e1.id,e1.spikeins_id,e1.name,e1.concentration,e2.TOT_R_0,e2.RPKM_0
 FROM `$db_name_ems`.`spikeinslist` e1,`$db_name_experiments`.`$tablename` e2 where e1.name=e2.refsec_id and e2.chrom='control' and e1.spikeins_id=$spikeins_id"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}
if (!($stmt->execute())) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}

$result = $stmt->get_result();
//$row = $res->fetch_assoc();

$query_array=array();


exec("Rscript spikeins.R $tablename $spikeins_id readonly readonly ems localhost",$output);

$inter=$output[1];
$slope=$output[3];
$r=$output[5];
//list($slope,$inters)=explode("  ",$output[6])

//logmsg(print_r($output,true));

$i=0;
//logmsg(print_r($_REQUEST,true));
while($row=$result->fetch_assoc()) {
    $DATA = array(
    'id' => $row['id'],
    'spikeins_id' => $row['spikeins_id'],
    'name' => $row['name'],
    'concentration' => $row['concentration'],
    'TOT_R_0' => $row['TOT_R_0'],
    'RPKM_0' => round($row['RPKM_0'],2),
    'inter' => floatval($inter),
    'slope' => floatval($slope),
    'R' => floatval($r),
    );
    $query_array[$i]=$DATA;
    $i++;
}
$stmt->close();
$con->close();
//Creating Json Array needed for Extjs Proxy
$res->success = true;
$res->message = "Data loaded";
$res->total = sizeof($query_array);
$res->data = $query_array;
//Printing json ARRAY
print_r($res->to_json());
?>

