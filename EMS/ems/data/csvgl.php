<?php
/****************************************************************************
 **
 ** Copyright (C) 2011 Andrey Kartashov .
 ** All rights reserved.
 ** Contact: Andrey Kartashov (porter@porter.st)
 **
 ** This file is part of the EMS web interface module of the genome-tools.
 **
 ** GNU Lesser General Public License Usage
 ** This file may be used under the terms of the GNU Lesser General Public
 ** License version 2.1 as published by the Free Software Foundation and
 ** appearing in the file LICENSE.LGPL included in the packaging of this
 ** file. Please review the following information to ensure the GNU Lesser
 ** General Public License version 2.1 requirements will be met:
 ** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
 **
 ** Other Usage
 ** Alternatively, this file may be used in accordance with the terms and
 ** conditions contained in a signed written agreement between you and Andrey Kartashov.
 **
 ****************************************************************************/

require_once('../auth.php');

if (!isset($_REQUEST['id']))
    $response->print_error('Not enough required parameters.');

if (!isset($_REQUEST['grp']))
    $response->print_error('Not enough required parameters.');

$id = $_REQUEST['id'];
$grp = ($_REQUEST['grp'] == "true");

$con = def_connect();
$EDB = $settings->settings['experimentsdb']['value'];


//$con->select_db($db_name_experiments);


function get_tbl_descr($tablename)
{
    global $con, $response, $EDB;
    if (!($stmt = $con->prepare("describe {$EDB}.`$tablename`"))) {
        $response->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
    }
    if (!$stmt->execute()) {
        $response->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
    }
    $result = $stmt->get_result();

    $TYPE = array();
    $HEAD = array();
    while ($row = $result->fetch_assoc()) {
        $TYPE[$row['Field']] = $row['Type'];
        $HEAD[$row['Field']] = $row['Field'];
    }
    $stmt->close();
    return array('TYPE' => $TYPE, 'HEAD' => $HEAD);
}


//if(!$grp) {
$qr = selectSQL("select tableName,type from genelist where id like ?", array("s", $id));
if (intVal($qr[0]['type']) == 101) {
    $tablename = $qr[0]['tableName'] . "_islands";
} elseif (intVal($qr[0]['type']) == 1) {
    $tablename = $qr[0]['tableName'] . "_isoforms";
} else {
    $tablename = $qr[0]['tableName'];
}
$descr = get_tbl_descr($tablename);
$HEAD = $descr['HEAD'];
$TYPE = $descr['TYPE'];

if (intVal($qr[0]['type']) == 101) {
    if (!($stmt = $con->prepare("SELECT * FROM {$EDB}.`$tablename` order by chrom, start, end "))) {
        $response->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
    }
} else if (intVal($qr[0]['type']) == 103) {
    if (!($stmt = $con->prepare("SELECT distinct * FROM {$EDB}.`$tablename` order by chrom, start, end "))) {
        $response->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
    }
} else {
    if (!($stmt = $con->prepare("SELECT * FROM {$EDB}.`$tablename` order by refseq_id,txStart,txEnd"))) {
        $response->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
    }
}
if (!($stmt->execute())) {
    $response->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$result = $stmt->get_result();
//}


header("Content-type: text/csv");
header("Content-Disposition: attachment; filename=$tablename.csv");
header("Pragma: no-cache");
header("Expires: 0");


$i = 0;
$outstream = fopen("php://output", 'w');
fputcsv($outstream, $HEAD, ',', '"');

while ($row = $result->fetch_assoc()) {
    $RPKM = array();
    foreach ($TYPE as $key => $val) {
        if ($val == 'float')
            $RPKM[$key] = round($row[$key], 2);
        else
            $RPKM[$key] = $row[$key];
    }
    fputcsv($outstream, $RPKM, ',', '"');
    $i++;
}

$stmt->close();
$con->close();
#$outstream->close();
?>
