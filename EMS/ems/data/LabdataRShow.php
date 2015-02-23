<?php
/****************************************************************************
 **
 ** Copyright (C) 2011-2015 Andrey Kartashov.
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

ignore_user_abort(true);
set_time_limit(600);


/**
 *
 */
function macs_parse($filename) {
    $script = "";

    if (file_exists($filename)) {
        $out = file($filename);
        foreach ($out as $line_num => $line) {
            $line = trim($line);
            if (preg_match("~(^#|\bpdf\b|\bdev\.)~", $line))
                continue;
            $script .= $line . "\n";
        }
    }
    return $script;
}

/*
 *
 *
 *
 */
$UID = "";
if (isset($_REQUEST['UID']) && $_REQUEST['UID'] != "") {
    $UID = $_REQUEST['UID'];
    check_val($UID);
}
$isCustom = false;
if (isset($_REQUEST['default']) && $_REQUEST['default'] != "") {
    $isCustom = intval($_REQUEST['default']) != 1;
}


if (!$worker->isAdmin()) {
    $SQL_QUERY .= "and (laboratory_id=? or (egroup_id in (select egroup_id from egrouprights where laboratory_id=? ) ) or egroup_id in (select id from egroup where laboratory_id=?) )";
    $PARAMS = array("ssss", $UID, $worker->worker['laboratory_id'], $worker->worker['laboratory_id'], $worker->worker['laboratory_id']);
    $LabdataRec = selectSQL("SELECT uid FROM `labdata` where uid = ? $SQL_QUERY", $PARAMS);
} else {
    $LabdataRec = selectSQL("SELECT uid FROM `labdata` where uid = ?", array('s', $UID));
}

if (count($LabdataRec) == 0) {
    $response->print_error("Insufficient privileges");
}

$fsuffix = "default";
if ($isCustom)
    $fsuffix = "custom";

$path = $settings->settings['wardrobe']['value'] . $settings->settings['preliminary']['value'];

$path_no_ext = $path . '/' . $UID . '/' . $UID;
$rfile = $path_no_ext . "_{$fsuffix}.r";

$svgfile = $path_no_ext . "_{$fsuffix}_%03d.png";
$svgmask = $path_no_ext . "_{$fsuffix}_*.png";

$outfile = $path_no_ext . "_{$fsuffix}.txt";
$errfile = $path_no_ext . "_{$fsuffix}_error.txt";

if ($isCustom) {
    $labdata_r = selectSQL("SELECT rscript,lastmodified FROM `labdata_r` where id = ?", array("s",$UID))[0];
} else {
    $labdata_r = selectSQL("SELECT rscript,lastmodified FROM `labdata_r` where id = 'default0-0000-0000-0000-000000000001'", array())[0];
}
if(!$labdata_r)
    exit(0);
$rscript = $labdata_r['rscript'];
$lastmodified = strtotime($labdata_r['lastmodified']);

$refresh = 1;

if (file_exists($rfile)) {
    $filemodified = filemtime($rfile);
    if ($filemodified - $lastmodified > 0)
        $refresh = 0;
}
$MACS = false;
if (file_exists($path_no_ext . "_macs_model.r") && !$isCustom) {
    $MACS = true;
}
if ($refresh) {

    if ($MACS)
        $mscript = macs_parse($path_no_ext . "_macs_model.r");

    $svgfiles = glob($svgmask);
    foreach ($svgfiles as $line_num => $line) {
        unlink($line);
    }

    $R_path = "/usr/bin/env Rscript ";
    $R_options = "--slave --vanilla --no-environ --no-site-file --no-init-file";

    $command = "{$R_path} {$R_options} {$rfile} '{$UID}' >{$outfile} 2>{$errfile}";

    if (strtoupper(substr(PHP_OS, 0, 5)) == "LINUX") {

    }

    $rcode = "
        args <- commandArgs(trailingOnly = TRUE)
        options(warn=-1)
        suppressMessages(library(wardrobe))
        experiment<-wardrobe(args[1])[[1]]
        #detach(\"package:wardrobe\", unload=TRUE)
        #detach(\"package:RMySQL\", unload=TRUE)
        png(filename='{$svgfile}')
        " . $rscript . "
        " . $mscript . "
        graphics.off()
        ";

    $fp = fopen($rfile, "w+");
    fwrite($fp, $rcode);
    chmod($rfile, 0666);
    fclose($fp);

    $exec_result = shell_exec($command);
}

$outstring = file($outfile);
$errstring = file($errfile);

$svgfiles = glob($svgmask);
$br = 0;
foreach ($svgfiles as $line_num => $line) {
    if ($br > 0 && $br % 2 == 0) {
        echo "<br>";
    }
    $br += 1;
    if ($MACS && count($svgfiles) - 2 == $line_num) {
        echo "<div style=\"text-align: center; font-size: 200%; color:#04408C;\"> Plots produced by MACS:</div><br>";
        $br = 0;
    }
    echo "<img src=\"" . str_replace($settings->settings['wardrobe']['value'], '', $line) . "?" . hash("md5", rand(1, 1000)) . "\" />";
}

if (count($outstring) > 0) {
    echo "<P>R output:<pre>";
    foreach ($outstring as $line_num => $line) {
        echo $line;
    }
    echo "</pre>";
}

if (count($errstring) > 0) {
    echo "<P> R errors:<pre>";
    foreach ($errstring as $line_num => $line) {
        echo $line;
    }
    echo "</pre>";
}

?>

