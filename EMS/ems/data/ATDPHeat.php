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

ini_set('memory_limit', '-1');
if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $response->print_error('Not enough required parameters.');

check_val($tablename);

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
$trim=1000;
$step = $window / $original_step;
$trim_steps=$trim/$original_step;

for ($i = -($original_window-$trim); $i < ($original_window-$trim); $i += $window) {
    if ($i >= 0) {
     $r=$i + $window;
        $smps[] ="+{$r}";
    }
    else
        $smps[] = "{$i}";
}

$g=0;
$m=0;
$sums=[];
$total=0;
$datag=[];
logmsg("BD Start",date("m.d h:i:s "));

foreach ($query_array as $record) {
    $heatv = unpack('v*', $record['heat']);

    $r=explode(',',$record['refseq_id'],2);
    $r1=explode(',',$record['gene_id'],2);
    $y[] = "refseq_id: {$r[0]} <br> gene_id: {$r1[0]}";
    $count = 0;
    //$gd = [];
    $total=count($heatv);
    $sum=0;
    $gened=[];
    for ($i = 0,$c = 0; $i < $total; $i++) {
        if($i<$trim_steps || $i+$trim_steps>$total)
            continue;
        $count += $heatv[$i];
        $sum += $heatv[$i];
        if (($i + 1) % $step == 0) {
            $gened[]=$count;
            //$data[] =array($c,$g,$count);
            $m=max($count,$m);
            $count = 0;
            $c++;
        }
    }
    $datag[$g]=$gened;
    $sums[$g]=$sum;
    $g+=1;
    //$data[] = $gd;
    //logmsg($t);
}
logmsg("BD Stop",date("m.d h:i:s "));

asort($sums);
$datas=[];
$ys=[];
logmsg("Resort",date("m.d h:i:s "));

$top=1000;
$skip=count($query_array)-$top;
$c=0;
foreach ($sums as $key => $val) {
//    if($skip>0) {
//        $skip--;
//        continue;
//    }
    $line=$datag[$key];
    $ys[]=$y[$key];
    for($i=0;$i<count($line);$i++) {
        $data[]=array($i,$c,$datag[$key][$i]);
        //echo("{$i},{$c},{$datag[$key][$i]}\n");
    }
    $c++;

}

//"TSS"=>$smps[floor($i/$step)],"Gene"=>$g,"v"=>$count
//$y["smps"] = $smps;
//$y["vars"] = $vars;
//$y["data"] = $data;
//$z["Symbol"]=$Symbol;
//$x["Type"]=$Type;

//$response->meta=array( "fields"=>$fields );
logmsg(date("m.d h:i:s "));


$response->success = true;
$response->message = "Data loaded";
$response->total = sizeof($data);
$response->data = array("max"=>$m,"catx"=>$smps,"caty"=>$ys,"index"=>$data);//array("y" => $y);
print_r($response->to_json());

?>

