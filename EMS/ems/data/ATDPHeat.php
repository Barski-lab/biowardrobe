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

ignore_user_abort(true);
set_time_limit(600);

ini_set('memory_limit', '-1');

if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $response->print_error('Not enough required parameters.');

check_val($tablename);
//$tablename="hDA8381E-4470-8F80-D39D-9AD5130FFF35_atdph";

$DB = $settings->settings['experimentsdb']['value'];

logmsg(date("m.d h:i:s "));
//$total = selectSQL("SELECT COUNT(*) as count FROM `{$DB}`.`$tablename`", array())[0]['count'];
$query_array = selectSQL("SELECT * FROM `{$DB}`.`$tablename` ", array());

$z = [];
$x = [];
$y = [];
$Symbol = [];
$Type = [];
$smps = [];
$data = [];
$window = 400;
$original_step = 5;
$original_window = 5000;
$trim = 0;
$step = $window / $original_step;
$trim_steps = $trim / $original_step;

//for ($i = -($original_window - $trim); $i < ($original_window - $trim); $i += $window) {
//
//    if ($i >= 0) {
//        $r = floor(($i + $window) / 1000);
//        if ($r != ($i + $window) / 1000) {
//            $smps[] = "";
//        } else {
//            $smps[] = "+{$r}k";
//        }
//    } else {
//        $r = ceil($i / 1000);
//        if ($r != $i / 1000) {
//            $smps[] = "";
//        } else {
//            $smps[] = "{$r}k";
//        }
//    }
//}

for ($i = -($original_window - $trim); $i < ($original_window - $trim); $i += $window) {
    $smps[] = "";
}
$smps[0] = ceil(-($original_window - $trim) / 1000) . "k";
$smps[count($smps) / 2] = "TSS";
$smps[count($smps) - 1] = "+" . floor(($original_window - $trim) / 1000) . "k";

$g = 0;
$m = 0;
$ma = 0;
$sums = [];
$total = 0;
$datag = [];
$alpha = 1 / count($query_array);

logmsg("BD Start ", date("m.d h:i:s "));

$groupby = 20;
$gcount = 0;
$generows = [];

foreach ($query_array as $record) {

    $heatv = unpack('v*', $record['heat']);

    $total = count($heatv);

    $count = 0;
    $sum = 0;
    $m = 0;
    $gened = [];

    for ($i = 0; $i < $total; $i++) {
//        if ($i < $trim_steps)
//            continue;
//        if ($i + $trim_steps > $total)
//            break;

        $count += $heatv[$i];
        $sum += $heatv[$i];
        if (($i + 1) % $step == 0) {
            $gened[] = $count;
            $count = 0;
        }
    }
//    $ma=($m*$alpha)+$ma*(1-$alpha);
    $generows[$g] = explode(',', $record['gene_id'], 2)[0];
    $datag[$g] = $gened;
    $sums[$g] = $sum;
    $g += 1;

}

logmsg("BD Stop ", date("m.d h:i:s "));

asort($sums);
$datas = [];
$ys = [];
logmsg("Resort ", date("m.d h:i:s "));

$skip = count($query_array) - $top;
$c = 0;

$qrtile1 = intVal(count($query_array) * 0.80);
$qrtile2 = intVal(count($query_array) * 0.90);
$gy = "";

logmsg($qrtile);

foreach ($sums as $key => $val) {
//    $ys[] = $y[$key];
    $gy .= "{$generows[$key]} ";

    $data1 = [];

    if ($c > $qrtile1 && $c < $qrtile2) {
        $maa = max($datag[$key]);
        $ma = max($ma,$maa);
    }

    $c++;
    $gcount++;
    if ($gcount != $groupby) continue;
    $gcount = 0;
//        for ($i = 0; $i < count($line); $i++) {
//            $data1[] = array($datag[$key][$i]);//, $c, $i);
//        }
//    } else {
//        for ($i = 0; $i < count($datag[$key]); $i++) {
//            //Highchart
//            //$data[]=array($i,$c,$datag[$key][$i]);
//            //D3
//            $data1[] = array($datag[$key][$i]);//, $c, $i);
//        }
//    }
    $data[] = $datag[$key];
    $ys[] = $gy;
    $gy = "";
}

logmsg(date("m.d h:i:s "));


$response->success = true;
$response->message = "Data loaded";
$response->total = sizeof($data);
//$response->data = array("max"=>$ma,"catx"=>$smps,"caty"=>$ys,"index"=>$data);//array("y" => $y);
$response->data = array("max" => $ma, "cols" => $smps, "rows" => $ys, "array" => $data); //array("y" => $y);
//logmsg($response->to_json());
print_r($response->to_json());


//D3
/*
echo("
var maxData = {$ma};\n
var cols = ");
print_r(json_encode($smps));
echo(";\n
var rows = ");
print_r(json_encode($ys));
echo(";\n
var data = ");
print_r(json_encode($data));
echo(";\n
var minData = 0;\n
");
*/
?>

