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

require_once('../auth.php');

if (isset($_REQUEST['uid']))
    $uid = $_REQUEST['uid'];
else
    $response->print_error('Not enough required parameters.');

$fasta = 0;
if (isset($_REQUEST['fasta']))
    $fasta = intval($_REQUEST['fasta']);
else
    $response->print_error('Not enough required parameters.');

check_val($uid);

$EDB = $settings->settings['experimentsdb']['value'];
$BASE = $settings->settings['wardrobe']['value'];
$TMP = $BASE . "/" . $settings->settings['temp']['value'];

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
$order = parse_sort_global($eparams->sort);

header("Content-type: text/plain");
header("Content-Disposition: attachment; filename=" . $experiment['alias'] . ".txt");
header("Pragma: no-cache");
header("Expires: 0");

$outstream = fopen("php://output", 'w');

$sislands = "start,end ";
$mislands = "start+length/2-{$fasta},end-length/2+{$fasta} ";
$sregions = "abssummit-{$fasta},abssummit+{$fasta} ";

$SQL = "SELECT distinct chrom,";

if ($broad || $fasta == 0) {
    $SQL .= $sislands;
} else {
    $SQL .= $sregions;
}

$SQL .= " FROM `{$EDB}`.`{$tablename}` where 0=0 $where ";

if ($eparams->uniqislands || $fasta == 0 || $broad) {
    $SQL .= " group by chrom,start,end ";
}

if ($order != "")
    $SQL .= " order by $order";

$query_array = selectSQL($SQL, array());

$tmpb = tempnam($TMP, "bed");

$handle = fopen($tmpb, "w");
foreach ($query_array as $dum => $val)
    fputcsv($handle, $val, chr(9));
fclose($handle);

$GENOME = $experiment['db'];

$command = "bedtools getfasta -fi \"{$BASE}/indices/${GENOME}.fa\" -bed {$tmpb} -fo - ";
$exec_result = shell_exec($command);
fwrite($outstream, $exec_result);
unlink($tmpb);
//$outstream->close();
?>
