<?php
/****************************************************************************
 **
 ** Copyright (C) 2011-2015 Andrey Kartashov .
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

$UID="";
if (isset($_REQUEST['UID']) && $_REQUEST['UID']!="") {
    $UID = $_REQUEST['UID'];
    check_val($UID);
}

if (!$worker->isAdmin()) {
    $SQL_QUERY .= "and (laboratory_id=? or (egroup_id in (select egroup_id from egrouprights where laboratory_id=? ) ) or egroup_id in (select id from egroup where laboratory_id=?) )";
    $PARAMS = array("ssss",$UID, $worker->worker['laboratory_id'], $worker->worker['laboratory_id'], $worker->worker['laboratory_id']);
    $LabdataRec = selectSQL("SELECT uid FROM `labdata` where uid = ? $SQL_QUERY", $PARAMS);
} else {
    $LabdataRec = selectSQL("SELECT uid FROM `labdata` where uid = ?", array('s', $UID));
}

if(count($LabdataRec) == 0) {
    $response->print_error("Insufficient privileges");
}


$path = $settings->settings['wardrobe']['value'] . $settings->settings['preliminary']['value'];

$path_no_ext = $path . '/' . $UID . '/' . $UID;
$rfile=$path_no_ext."_default.r";

$svgfile=$path_no_ext."_default_%03d.png";
$svgmask=$path_no_ext."_*.png";

$outfile=$path_no_ext."_default.txt";
$errfile=$path_no_ext."_default_error.txt";

$rscript = selectSQL("SELECT rscript FROM `labdata_r` where id = 'default0-0000-0000-0000-000000000001'", array())[0]['rscript'];

$R_path = "/usr/bin/env Rscript ";
$R_options = "--slave --vanilla --no-environ --no-site-file --no-init-file";

$command = "{$R_path} {$R_options} {$rfile} '{$UID}' >{$outfile} 2>{$errfile}";

$rcode="
args <- commandArgs(trailingOnly = TRUE)
options(warn=-1)
#library(DBI)
suppressMessages(library(RMySQL))
suppressMessages(library(BiocParallel))
register(MulticoreParam(4))
source('/wardrobe/src/scripts/R/wardrobe.R')
experiment<-wardrobe(args[1])[[1]]
detach(\"package:RMySQL\", unload=TRUE)
#detach(\"package:DBI\", unload=TRUE)
png(filename='{$svgfile}')
".$rscript."
graphics.off()
";

$fp = fopen($rfile,"w+");
fwrite($fp,$rcode);
chmod($rfile, 0666);
fclose($fp);

$exec_result = shell_exec($command);

$outstring = file($outfile);
$errstring = file($errfile);

$svgfiles = glob($svgmask);
foreach ($svgfiles as $line_num => $line) {
    if($line_num>0 && $line_num%2 == 0) {
    }
    echo "<img src=\"".str_replace($settings->settings['wardrobe']['value'],'',$line)."\" />";
}

if (count($outstring) >0) {
    echo "<P>R output:<pre>";
    foreach ($outstring as $line_num => $line) {
        echo $line;
    }
    echo "</pre>";
}

if (count($errstring) >0) {
    echo "<P> R errors:<pre>";
    foreach ($errstring as $line_num => $line) {
        echo $line;
    }
    echo "</pre>";
}


//$response->success = true;
//$response->message = "Data updated";
//$response->total = 1;
//print_r($response->to_json());
?>

