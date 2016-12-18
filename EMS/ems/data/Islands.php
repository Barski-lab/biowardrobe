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

//logmsg($_REQUEST);

if (isset($_REQUEST['uid']))
    $uid = $_REQUEST['uid'];
else
    $res->print_error('Not enough required parameters.');
check_val($uid);

$EDB = $settings->settings['experimentsdb']['value'];
$TMP = $settings->settings['wardrobe']['value'] . '/' . $settings->settings['temp']['value'];;
$BIN = $settings->settings['wardrobe']['value'] . '/' . $settings->settings['bin']['value'];;


$tablename = "{$uid}_islands";
$describe = selectSQL("describe `{$EDB}`.`{$tablename}`", array());

$experiment = get_preliminary_table_info($uid);
$eparams = json_decode($experiment ['params']);

if (isset($_REQUEST['promoter'])) {
    $promoter = intval($_REQUEST['promoter']);
    if ($promoter == $eparams->promoter) {
        $promoter = -1;
    } else {
        $eparams->promoter = $promoter;
    }
} else {
    $promoter = -1;
}

if ($describe[0]['Field'] != "refseq_id" || $promoter != -1) {
    if ($promoter == -1) {
        $promoter = 1000;
        $eparams->promoter = $promoter;
    }
    ignore_user_abort(true);
    set_time_limit(600);
    $command = "{$BIN}/iaintersect -uid=\"{$uid}\" -log=\"{$TMP}/iaintersect.log\" -promoter={$promoter}";
    exec($command, $output, $retval);
    if ($retval != 0)
        $response->print_error("Cant execute command " . print_r($output, true));
}

if (isset($_REQUEST['retainfilter'])) {
    $eparams->filter = $filter;
    $eparams->sort = $sort;
}


if (isset($_REQUEST['uniqislands']) && $_REQUEST['uniqislands'] == "true") {
    $eparams->uniqislands = true;
} else if (isset($_REQUEST['uniqislands']) && $_REQUEST['uniqislands'] == "false") {
    $eparams->uniqislands = false;
}

if (isset($_REQUEST['csv'])) {

    $where = parse_where_global($eparams->filter);
    if ($where != "")
        $where = " where 0=0 " . $where;
    $order = parse_sort_global($eparams->sort);
    if($order!="")
        $order = "order by " . $order;
}

if ($eparams->uniqislands) {
    $SQL = "select distinct refseq_id,gene_id,txStart,txEnd,strand,chrom,start,end,max(length),
    max(log10p) as log10p,
    max(foldenrich) as foldenrich ,
    max(log10q) as log10q, region from `{$EDB}`.`{$tablename}` $where group by chrom,start,end $order $limit";
    $total = selectSQL("SELECT COUNT(distinct start) as count FROM `{$EDB}`.`{$tablename}` $where")[0]['count'];
    $query_array = selectSQL($SQL, array());
} else {
    $total = selectSQL("SELECT COUNT(*) as count FROM `{$EDB}`.`{$tablename}` $where")[0]['count'];
    $query_array = selectSQL("SELECT * FROM `{$EDB}`.`{$tablename}` $where $order $limit", array());
}

if (execSQL($settings->connection, "update labdata set params=? where uid=?", array("ss", json_encode($eparams), $uid), true) == 0) {

}

if (isset($_REQUEST['csv'])) {
    $outstream = fopen("php://output", 'w');
    header("Content-type: text/csv");
    header("Content-Disposition: attachment; filename=" . $experiment['alias'] . ".csv");
    header("Pragma: no-cache");
    header("Expires: 0");
    $HEAD = array();
    foreach ($describe as $d => $v) {
        if($eparams->uniqislands && $v['Field'] == "abssummit")
            continue;
        $HEAD[$v['Field']] = $v['Field'];
    }
    fputcsv($outstream, $HEAD, ',', '"');
    foreach ($query_array as $d => $v) {
        fputcsv($outstream, $v, ',', '"');
    }
} else {
    $res->success = true;
    $res->message = "Data loaded";
    $res->total = $total;
    $res->data = $query_array;
    print_r($res->to_json());
}
?>
