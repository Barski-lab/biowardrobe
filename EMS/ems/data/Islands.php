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

require_once('../settings.php');

if (isset($_REQUEST['uid']))
    $uid = $_REQUEST['uid'];
else
    $res->print_error('Not enough required parameters.');
check_val($uid);

$uniqislands = false;
if (isset($_REQUEST['uniqislands']))
    $uniqislands = $_REQUEST['uniqislands'];

$promoter = 0;
if (isset($_REQUEST['promoter']))
    $promoter = $_REQUEST['promoter'];

$EDB = $settings->settings['experimentsdb']['value'];
$TMP = $settings->settings['wardrobe']['value'].'/'.$settings->settings['temp']['value'];;
$BIN = $settings->settings['wardrobe']['value'].'/'.$settings->settings['bin']['value'];;


$tablename = "{$uid}_islands";
$describe = selectSQL("describe `{$EDB}`.`{$tablename}`", array());

if ($describe[0]['Field'] != "refseq_id" || $promoter) {
    if (!$promoter) $promoter = 1000;
    ignore_user_abort(true);
    set_time_limit(600);
    $command = "${BIN}/iaintersect -uid=\"{$uid}\" -log=\"{$TMP}/iaintersect.log\" -promoter={$promoter}";
    exec($command, $output, $retval);
    if ($retval != 0)
        $response->print_error("Cant execute command " . print_r($output, true));
}


if ($uniqislands == "true") {
    $SQL = "select distinct refseq_id,gene_id,txStart,txEnd,strand,region,chrom,start,end,length,max(log10p) as log10p,max(foldenrich) as foldenrich ,max(log10q) as log10q from `{$EDB}`.`{$tablename}` $where group by start,end,length $order $limit";
    $total = selectSQL("SELECT COUNT(distinct start) as count FROM `{$EDB}`.`{$tablename}` $where")[0]['count'];
    $query_array = selectSQL($SQL, array());
} else {
    $total = selectSQL("SELECT COUNT(*) as count FROM `{$EDB}`.`{$tablename}` $where")[0]['count'];
    $query_array = selectSQL("SELECT * FROM `{$EDB}`.`{$tablename}` $where $order $limit", array());
}


$res->success = true;
$res->message = "Data loaded";
$res->total = $total;
$res->data = $query_array;
print_r($res->to_json());

?>
