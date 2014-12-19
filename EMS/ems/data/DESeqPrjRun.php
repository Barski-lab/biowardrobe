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

ignore_user_abort(true);
set_time_limit(600);

require_once('../settings.php');

//logmsg(__FILE__);

try {
    $data = json_decode(file_get_contents('php://input'));
} catch (Exception $e) {
    $response->print_error("Cant read input" . $e);
}
//logmsg(print_r($data, true));
$count = 0;

if (gettype($data->deseq) == "array") {
    $response->print_error("Not supported yet.");
}

if (!isset($data->atype_id) || !isset($data->project_id) || !isset($data->deseq) || !isset($data->deseq->name) || !isset($data->deseq->seriestype)) {
    $response->print_error("no data");
}

$EDB = $settings->settings['experimentsdb']['value'];


$atypeid = intval($data->atype_id);
$timeseries = intval($data->deseq->seriestype);

check_val($data->project_id);
$projectid = $data->project_id;

$NAME = $data->deseq->name;
$rtypeid = intVal($data->deseq->annottype);

$deseq = $data->deseq->deseq;
$delength = count($deseq);

if ($delength < 2) {
    $response->print_error("Is it me who post this?");
}

$con = def_connect();
$con->autocommit(FALSE);

$tablepairs = array();

check_val($deseq[0]->table);
$tn = get_table_info($deseq[0]->table);
if (!$tn)
    $response->print_error("no tablename data");
$tablenames[$deseq[0]->table] = array("table" => $tn[0]['tableName'], "gblink" => $tn[0]['gblink'], "name" => $tn[0]['name']);
$DB=$tn[0]['db'];
if (intval($deseq[0]->order) != 1)
    $response->print_error("Incorrect ordering.");

$prefix = "";

if ($delength == 2 || $timeseries == 1) {
    for ($i = 1; $i < $delength; $i++) {
        check_val($deseq[$i]->table);
        $tn = get_table_info($deseq[$i]->table);
        if (!$tn)
            $response->print_error("no tablename data");
        $tablenames[$deseq[$i]->table] = array("table" => $tn[0]['tableName'], "gblink" => $tn[0]['gblink'], "name" => $tn[0]['name']);

        $tablepairs[] = array("id" => $i, "t1" => $deseq[$i - 1]->table, "t2" => $deseq[$i]->table);

        if (intval($deseq[$i]->order) != $i + 1)
            $response->print_error("Incorrect ordering.");
    }
    $prefix = "t";
} elseif ($timeseries == 2) { // kinetics
    for ($i = 1; $i < $delength; $i++) {
        check_val($deseq[$i]->table);
        $tn = get_table_info($deseq[$i]->table);
        if (!$tn)
            $response->print_error("no tablename data");
        $tablenames[$deseq[$i]->table] = array("table" => $tn[0]['tableName'], "gblink" => $tn[0]['gblink'], "name" => $tn[0]['name']);

        $tablepairs[] = array("id" => $i, "t1" => $deseq[0]->table, "t2" => $deseq[$i]->table);

        if (intval($deseq[$i]->order) != $i + 1)
            $response->print_error("Incorrect ordering.");
    }
    $prefix = "k";
} elseif ($timeseries == 3) { // pairwise
    $c = 1;
    for ($i = 0; $i < $delength - 1; $i++) {
        if (intval($deseq[$i]->order) != $i + 1)
            $response->print_error("Incorrect ordering.");
        check_val($deseq[$i]->table);
        $tn = get_table_info($deseq[$i]->table);
        if (!$tn)
            $response->print_error("no tablename data");
        $tablenames[$deseq[$i]->table] = array("table" => $tn[0]['tableName'], "gblink" => $tn[0]['gblink'], "name" => $tn[0]['name']);
        for ($j = $i + 1; $j < $delength; $j++) {
            check_val($deseq[$j]->table);
            $tn1 = get_table_info($deseq[$j]->table);
            if (!$tn1)
                $response->print_error("no tablename data");
            $tablenames[$deseq[$j]->table] = array("table" => $tn1[0]['tableName'], "gblink" => $tn1[0]['gblink'], "name" => $tn1[0]['name']);
            $tablepairs[] = array("id" => $c, "t1" => $deseq[$i]->table, "t2" => $deseq[$j]->table);
            $c++;
        }
    }
    $prefix = "p";
}

$tbpairlen = count($tablepairs);

$gblink = "";
$READABLE = "";
$DESEQN = "DESeq";
if ($atypeid == 3)
    $DESEQN = "DESeq2";

for ($i = 0; $i < $tbpairlen; $i++) {
    $output = "";
    set_time_limit(300);
    sleep(5);
    $UUID = guid();
    $TNAME = str_replace("-", "", $UUID);
    $TNAMES[] = $TNAME;
    $CMD = "Rscript DESeqN.R {$settings->db_user} {$settings->db_pass} {$EDB} {$settings->db_host} {$settings->db_name} " . $tablepairs[$i]['t1'] . " " . $tablepairs[$i]['t2'] . " $rtypeid $TNAME $atypeid";
    exec($CMD, $output, $retval);

    if ($retval != 0) {
        logmsg($output,$CMD);
        $response->print_error("Cant execute R."); #.print_r($output,true)
        //logmsg(print_r($output,true));
    }
    execSQL($con,
        "ALTER TABLE `{$EDB}`.`" . $TNAME . "` " .
        "  CHANGE COLUMN `refseq_id` `refseq_id` VARCHAR(1000) NULL DEFAULT NULL" .
        ", CHANGE COLUMN `gene_id` `gene_id` VARCHAR(500) NULL DEFAULT NULL" .
        ", CHANGE COLUMN `chrom` `chrom` VARCHAR(45) NULL DEFAULT NULL" .
        ", CHANGE COLUMN `txStart` `txStart` INT(11) NULL DEFAULT NULL" .
        ", CHANGE COLUMN `txEnd` `txEnd` INT(11) NULL DEFAULT NULL" .
        ", CHANGE COLUMN `strand` `strand` VARCHAR(1) NULL DEFAULT NULL" .
        ", ADD INDEX `index1` USING HASH (`refseq_id`(150) ASC)" .
        ", ADD INDEX `index2` USING HASH (`gene_id`(150) ASC)" .
        ", ADD INDEX `index3` USING HASH (`chrom` ASC)" .
        ", ADD INDEX `index4` USING HASH (`strand` ASC)" .
        ", ADD INDEX `index5` USING BTREE (`txStart` ASC)" .
        ", ADD INDEX `index6` USING BTREE (`txEnd` ASC);", array(), true);

    $RNAME = $NAME;
    if ($tbpairlen != 1) {
        $c = $i + 1;
        $RNAME = $NAME . " ($prefix$c)";
    }

    $gblink = $tablenames[$tablepairs[$i]['t1']]['gblink'] . "&" . $tablenames[$tablepairs[$i]['t2']]['gblink'];
    $EXT = get_extension($rtypeid);
    $READABLE = "Annotation grouping (" . $EXT['name'] . ") were used for $DESEQN analysis.<br> Data from " .
        "'" . $tablenames[$tablepairs[$i]['t1']]['name'] . "' and '" . $tablenames[$tablepairs[$i]['t2']]['name'] . "' has been chosen.";

    execSQL($con,
        "insert into genelist (id,name,project_id,leaf,db,`type`,tableName,gblink,conditions,rtype_id,atype_id) values(?,?,?,1,?,3,?,?,?,?,?)",
        array("sssssssii", $UUID, $RNAME, $projectid, $DB, $TNAME, $gblink, $READABLE, $rtypeid, $atypeid), true);

    if (!$con->commit()) {
        $response->print_error("Cant commit");
    }
}

if (!$con->commit()) {
    $response->print_error("Cant commit");
}


/*
//$data->id;//] => 0
//$data->name; //] => PCA1_result
//$data->description;//] => PCA1_result
//$data->rtype_id;//] => 0
//$data->atype_id;//] => 2
//$data->ahead_id;//] => 1
//$data->labdata_id;//] => 0
//$data->project_id;//] => 1

*/


$con->close();


$response->success = true;
$response->message = "Data loaded";
$response->total = $tbpairlen;
//$response->data = $query_array;
print_r($response->to_json());

?>
