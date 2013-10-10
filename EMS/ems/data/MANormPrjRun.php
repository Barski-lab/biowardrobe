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

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

logmsg(__FILE__);

try {
    $data = json_decode(file_get_contents('php://input'));
} catch (Exception $e) {
    $res->print_error("Cant read input" . $e);
}
logmsg(print_r($data, true));
$count = 0;


if (gettype($data->manorm) == "array") {
    $res->print_error("Not supported yet.");
}

if (!isset($data->atype_id) || !isset($data->project_id) || !isset($data->manorm) || !isset($data->manorm->name) || !isset($data->manorm->seriestype)) {
    $res->print_error("no data");
}

$atypeid = intval($data->atype_id);
$timeseries = intval($data->manorm->seriestype);

check_val($data->project_id);
$projectid = $data->project_id;

$NAME = $data->manorm->name;

$manorm = $data->manorm->manorm;
$malength = count($manorm);

if ($malength < 2) {
    $res->print_error("Is it me who post this?");
}

$con = def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

$tablepairs = array();

check_val($manorm[0]->table);
$tn = get_table_info($manorm[0]->table);
if (!$tn)
    $res->print_error("no tablename data");

$tablenames[$manorm[0]->table] = array(
    "table" => $tn[0]['tableName'],
    "gblink" => $tn[0]['gblink'],
    "name" => $tn[0]['name'],
    "worker" => $tn[0]['worker'],
    "fragmentsize" => intval($tn[0]['fragmentsize'] / 2),
    "flanked" => 0);

$DB=$tn[0]['db'];

if (intval($manorm[0]->order) != 1)
    $res->print_error("Incorrect ordering.");

$prefix = "";

if ($malength == 2 || $timeseries == 1) {
    for ($i = 1; $i < $malength; $i++) {
        check_val($manorm[$i]->table);
        $tn = get_table_info($manorm[$i]->table);
        if (!$tn)
            $res->print_error("no tablename data");

        $tablenames[$manorm[$i]->table] = array(
            "table" => $tn[0]['tableName'],
            "gblink" => $tn[0]['gblink'],
            "name" => $tn[0]['name'],
            "worker" => $tn[0]['worker'],
            "fragmentsize" => intval($tn[0]['fragmentsize'] / 2),
            "flanked" => 0);

        $tablepairs[] = array("id" => $i, "t1" => $manorm[$i - 1]->table, "t2" => $manorm[$i]->table);

        if (intval($manorm[$i]->order) != $i + 1)
            $res->print_error("Incorrect ordering.");
    }
    $prefix = "t";
} else {
    $res->print_error("More then two and other then timeseries not supported yet.");
}


/*elseif ($timeseries == 2) { // kinetics
    for ($i = 1; $i < $delength; $i++) {
        check_val($deseq[$i]->table);
        $tn = get_table_info($deseq[$i]->table);
        if (!$tn)
            $res->print_error("no tablename data");
        $tablenames[$deseq[$i]->table] = array("table" => $tn[0]['tableName'], "gblink" => $tn[0]['gblink'], "name" => $tn[0]['name']);

        $tablepairs[] = array("id" => $i, "t1" => $deseq[0]->table, "t2" => $deseq[$i]->table);

        if (intval($deseq[$i]->order) != $i + 1)
            $res->print_error("Incorrect ordering.");
    }
    $prefix = "k";
} elseif ($timeseries == 3) { // pairwise
    $c = 1;
    for ($i = 0; $i < $delength - 1; $i++) {
        if (intval($deseq[$i]->order) != $i + 1)
            $res->print_error("Incorrect ordering.");
        check_val($deseq[$i]->table);
        $tn = get_table_info($deseq[$i]->table);
        if (!$tn)
            $res->print_error("no tablename data");
        $tablenames[$deseq[$i]->table] = array("table" => $tn[0]['tableName'], "gblink" => $tn[0]['gblink'], "name" => $tn[0]['name']);
        for ($j = $i + 1; $j < $delength; $j++) {
            check_val($deseq[$j]->table);
            $tn1 = get_table_info($deseq[$j]->table);
            if (!$tn1)
                $res->print_error("no tablename data");
            $tablenames[$deseq[$j]->table] = array("table" => $tn1[0]['tableName'], "gblink" => $tn1[0]['gblink'], "name" => $tn1[0]['name']);
            $tablepairs[] = array("id" => $c, "t1" => $deseq[$i]->table, "t2" => $deseq[$j]->table);
            $c++;
        }
    }
    $prefix = "p";
}
*/

$tbpairlen = count($tablepairs);

$gblink = "";
$READABLE = "";

for ($i = 0; $i < $tbpairlen; $i++) {
    $output = "";
    set_time_limit(900);
    sleep(5);
    $UUID = guid();
    $TNAME = str_replace("-", "", $UUID);
    $TNAMES[] = $TNAME;
    $T1 = $tablepairs[$i]['t1'];
    $T2 = $tablepairs[$i]['t2'];
    $CMD = "./MAnormSQLMacs.sh " . $tablenames[$T1]['table'] . "_macs " . $tablenames[$T2]['table'] . "_macs " .
        $BASE_DIR . "/" . $tablenames[$T1]['worker'] . "/DNA/" . $tablenames[$T1]['table'] . ".bam " .
        $BASE_DIR . "/" . $tablenames[$T2]['worker'] . "/DNA/" . $tablenames[$T2]['table'] . ".bam " .
        $tablenames[$T1]['fragmentsize'] . " " .
        $tablenames[$T2]['fragmentsize'] . " " .
        $tablenames[$T1]['flanked'] . " " .
        $tablenames[$T2]['flanked'] . " " . $TNAME. " " .$db_name_experiments;

    exec($CMD, $output, $retval);

    if ($retval != 0) {
        logmsg(print_r($output, true));
        $res->print_error("Cant execute MANorm . "); #.print_r($output,true)
    }


    $RNAME = $NAME;
    if ($tbpairlen != 1) {
        $c = $i + 1;
        $RNAME = $NAME . " ($prefix$c)";
    }

    $gblink = $tablenames[$tablepairs[$i]['t1']]['gblink'] . "&" . $tablenames[$tablepairs[$i]['t2']]['gblink'];

    $READABLE = "MANorm were used for analysis .<br > Data from " .
        "'" . $tablenames[$tablepairs[$i]['t1']]['name'] . "' and '" . $tablenames[$tablepairs[$i]['t2']]['name'] . "' has been compared. ";


//chr<--->start<->end<--->description<--->#raw_read_1<--->#raw_read_2<--->M_value_rescaled<------>A_value_rescaled<------>-log10(p-value)
//chr1<-->860184<>860719<>unique_peak1<-->18<---->11<---->0.645644203583194<----->3.90778460251275<------>0.769930178837768

    if (($handle = fopen("/data/DATA/MANORM/".$TNAME."/MAnorm_result_commonPeak_merged.xls", "r")) !== FALSE) {

        execSQL($con,
            "create table " . $db_name_experiments . ".`" . $TNAME ."` (" .
            "`chrom` VARCHAR(45) NOT NULL," .
            "`start` INT NULL ," .
            "`end` INT NULL ," .
            "`description` VARCHAR(100) NOT NULL," .
            "`raw_read1` INT NULL ," .
            "`raw_read2` INT NULL ," .
            "`M_value_rescaled` float NULL ," .
            "`A_value_rescaled` float NULL ," .
            "`log10_p_value` float NULL ," .
            "INDEX chr_idx (chrom) using btree," .
            "INDEX start_idx (start) using btree," .
            "INDEX end_idx (end) using btree" .
            ")" .
            "ENGINE = MyISAM " .
            "COMMENT = 'created by manorm';",
            array(), true);
            
        fgetcsv($handle, 2000, "\t");//header

        while (($data = fgetcsv($handle, 2000, "\t")) !== FALSE) {
            execSQL($con,
                "insert into " . $db_name_experiments . " . ".$TNAME.
                "(chrom,start,end,description,raw_read1,raw_read2,M_value_rescaled,A_value_rescaled,log10_p_value)".
                 "values(?,?,?,?,?,?,?,?,?)",
                array("siisiiddd", $data[0],$data[1],$data[2],$data[3],$data[4],$data[5],$data[6],$data[7],$data[8]), true);
        }
        fclose($handle);
    } else {
        $res->print_error("Cant find MANorm output. "); #.print_r($output,true)
    }

    execSQL($con,
        "insert into " . $db_name_ems . ".genelist (id, name, project_id, leaf, db, `type`, tableName, gblink, conditions, atype_id) values(?,?,?,1,?,103,?,?,?,?)",
        array("sssssssi", $UUID, $RNAME, $projectid, $DB, $TNAME, $gblink, $READABLE, $atypeid), true);

    if (!$con->commit()) {
        $res->print_error("Cant commit");
    }

}

if (!$con->commit()) {
    $res->print_error("Cant commit");
}


$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = 0; //$tbpairlen;
$res->data = array(); //$query_array;
print_r($res->to_json());

?>
