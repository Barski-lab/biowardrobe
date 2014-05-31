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

require_once('../settings.php');


//logmsg(print_r($_REQUEST,true));

if(isset($_REQUEST['sequence']))
    $sequence = $_REQUEST['sequence'];
else
    $res->print_error('Not enough required parameters.');
check_val($sequence);

if(isset($_REQUEST['cutlen']))
    $cutlen = intVal($_REQUEST['cutlen']);
else
    $res->print_error('Not enough required parameters.');


if(strlen($sequence)<$cutlen)
    $res->print_error('Sequence lenght is not enough');

if(isset($_REQUEST['findex']))
    $findex = $_REQUEST['findex'];
else
    $res->print_error('Not enough required parameters.');
check_val($findex);

if( !($findex=='hg19' || $findex=='mm10') )
    $res->print_error('Genome not supported');


if(isset($_REQUEST['shift']))
    $shift = intVal($_REQUEST['shift']);
else
    $res->print_error('Not enough required parameters.');

if($shift<1)
    $res->print_error('Shift should be greater then one');

$query_array=array();




$fn = tempnam ('/tmp', 'seqcut-');
if ($fn) {
    $temp = fopen ($fn, 'w+');
    if (!$temp) {
        $res->print_error('Cant open file');
    }
}

for($i=0;$i<=strlen($sequence)-$cutlen;$i+=$shift) {

    $str=substr($sequence,$i,$cutlen);
    fwrite($temp,">".$str."\n");
    fwrite($temp,$str."\n");
}

$output=shell_exec("cat $fn |bowtie -f -v 0 -p 7 -M 30 --suppress 2,3,4,5,6 --quiet $gpath/$findex - ");

if(!$output) {
    $res->print_error('Cant run bowtie');
    unlink ($fn);
}

$arr = explode("\n",$output);
$i=0;
foreach( $arr as $key => $val) {
    if(strlen($val)>0) {
    $DATA = array(
        'sequence' => substr($val,0,$cutlen),
        'align' => intVal(trim(substr($val,$cutlen)))+1 );
    $query_array[$i]=$DATA;
    }
    $i++;
}

unlink ($fn);

$res->success = true;
$res->message = "Data loaded";
$res->total = sizeof($query_array);
$res->data = $query_array;
print_r($res->to_json());
?>

