<?php
/****************************************************************************
 **
 ** Copyright (C) 2011-2014 Andrey Kartashov .
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

require("../settings.php");

if (isset($_REQUEST['uid']))
    $uid = $_REQUEST['uid'];
else
    $response->print_error('Not enough required parameters.');

if (isset($_REQUEST['fasta']))
    $fasta = intval($_REQUEST['fasta']);
else
    $response->print_error('Not enough required parameters.');

check_val($uid);

$EDB = $settings->settings['experimentsdb']['value'];
$BASE = $settings->settings['wardrobe']['value'];
$TMP = $BASE . "/" . $settings->settings['temp']['value'];

//if($tablename!="labdata") {
//    $settings->connection->select_db($EDB);
//}
$tablename = "${uid}_islands";

$tablename = "{$uid}_islands";
$describe = selectSQL("describe `{$EDB}`.`{$tablename}`", array());

$broad = true;
foreach ($describe as $d => $v)
    if ($v['Field'] == 'abssummit') {
        $broad = false;
        break;
    }


$experiment = get_preliminary_table_info($uid);
$eparams = json_decode($experiment ['params']);
$where = parse_where_global($eparams->filter);

header("Content-type: text/plain");
header("Content-Disposition: attachment; filename=" . $experiment['alias'] . ".txt");
header("Pragma: no-cache");
header("Expires: 0");


$i = 0;
$outstream = fopen("php://output", 'w');

if ($eparams->uniqislands) {
//    $SQL = "select distinct refseq_id,gene_id,txStart,txEnd,strand,region,chrom,start,end,length,max(log10p) as log10p,max(foldenrich) as foldenrich ,max(log10q) as log10q
// from `{$EDB}`.`{$tablename}` where 0=0 $where group by start,end,length $order";
//    $query_array = selectSQL($SQL, array());
} else {
}
$query_array = selectSQL("SELECT chrom,abssummit-{$fasta},abssummit+{$fasta} FROM `{$EDB}`.`{$tablename}` where 0=0 $where $order", array());

$tmpb = tempnam($TMP, "bed");
//$tmpfa = tempnam($TMP, "fasta");

$handle = fopen($tmpb, "w");
foreach ($query_array as $dum => $val)
    fputcsv($handle, $val, chr(9));
fclose($handle);

$GENOME = $experiment['db'];


$command = "bedtools getfasta -fi \"{$BASE}/indices/${GENOME}.fa\" -bed {$tmpb} -fo - ";
logmsg("broad=", $broad,$command);
$exec_result = shell_exec($command);
fwrite($outstream, $exec_result);

//$outstream->close();
?>
