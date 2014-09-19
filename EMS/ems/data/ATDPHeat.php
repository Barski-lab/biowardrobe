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

$picture_height = 2000;

$window = 400;
$trim = 0;

$original_step = 5;
$original_window = 5000;


if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $response->print_error('Not enough required parameters.');

check_val($tablename);
//$tablename="hDA8381E-4470-8F80-D39D-9AD5130FFF35_atdph";

$DB = $settings->settings['experimentsdb']['value'];

logmsg(date("m.d h:i:s "));

$query_array = selectSQL("SELECT * FROM `{$DB}`.`$tablename` ", array());

$step = $window / $original_step;
$trim_steps = $trim / $original_step;

$cols = [];
for ($i = -($original_window - $trim); $i < ($original_window - $trim); $i += $window) {
    $cols[] = "";
}
$cols[0] = ceil(-($original_window - $trim) / 1000) . "k";
$cols[count($cols) / 2] = "TSS";
$cols[count($cols) - 1] = "+" . floor(($original_window - $trim) / 1000) . "k";

$g = 0;
$sums = [];
$total = 0;
$datag = [];

logmsg("BD Start ", date("m.d h:i:s "));

$groupby = count($query_array) / $picture_height;

if ($groupby < 1) {
    $groupby = 1;
} else {
    $groupby = floor($groupby);
}

$generows = [];
foreach ($query_array as $record) {
    $heatv = unpack('v*', $record['heat']);
    $total = count($heatv);

    $count = 0;
    $sum = 0;
    $gened = [];

    for ($i = 0; $i < $total; $i++) {

        if ($i < $trim_steps)
            continue;
        if ($i + $trim_steps > $total)
            break;

        if(isset($heatv[$i])) {
            $count += $heatv[$i];
            $sum += $heatv[$i];
        }

        if (($i + 1) % $step == 0) {
            $gened[] = $count;
            $count = 0;
        }
    }

    $generows[$g] = explode(',', $record['gene_id'], 2)[0];
    $datag[$g] = $gened;
    $sums[$g] = $sum;
    $g += 1;

}

logmsg("BD Stop ", date("m.d h:i:s "));

asort($sums);
logmsg("Resort ", date("m.d h:i:s "));


$qrtile1 = intVal(count($query_array) * 0.80);
$qrtile2 = intVal(count($query_array) * 0.90);
$gy = "";

$c = 0;
$gcount = 0;
$data = [];
$rows = [];
$max = 0;
$dataaver = [];
foreach ($sums as $key => $val) {

    $gy .= "{$generows[$key]} ";

    if ($groupby > 1) {
        foreach ($datag[$key] as $k => $v)
            if ( !isset($dataaver[$k]) ) {
                $dataaver[$k]=0;
            }
            $dataaver[$k] += $v/$groupby;
    } else {
        $dataaver=$datag[$key];
    }
    if ($c > $qrtile1 && $c < $qrtile2) {
        $maa = max($dataaver);
        $max = max($max, $maa);
    }

    $c++;

    $gcount++;
    if ($gcount % 5 == 0 ) $gy .= "<br>";
    if ($gcount != $groupby) continue;
    $gcount = 0;

    //$data[] = $datag[$key];
    $data[] = $dataaver;
    $rows[] = $gy;
    $gy = "";
    $dataaver = [];
}

logmsg(date("m.d h:i:s "));


$response->success = true;
$response->message = "Data loaded";
$response->total = sizeof($data);
$response->data = array("max" => $max, "cols" => $cols, "rows" => $rows, "array" => $data); //array("y" => $y);
//logmsg($response->to_json());
print_r($response->to_json());

?>

