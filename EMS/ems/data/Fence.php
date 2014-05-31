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

require_once("../settings.php");


$recordid = $_REQUEST['recordid'];
check_val($recordid);
$path=$settings->settings['wardrobe']['value'].$settings->settings['preliminary']['value'];
$file=$path.'/'.$recordid.'/'.$recordid.'.fence';

if(file_exists($file))
    $handle = fopen($file, "r");
else
    $handle = fopen("./fence.dat", "r");

if ($handle) {
    $line = fgets($handle); #header
    $A = explode(" ", preg_replace('/\s+/', ' ', fgets($handle))); #A
    $C = explode(" ", preg_replace('/\s+/', ' ', fgets($handle))); #C
    $T = explode(" ", preg_replace('/\s+/', ' ', fgets($handle))); #T
    $G = explode(" ", preg_replace('/\s+/', ' ', fgets($handle))); #G
    $N = explode(" ", preg_replace('/\s+/', ' ', fgets($handle))); #N
}

$data=array();
for($i =2;$i<count($A)-1;$i++) {
    $data[]=array(
        'id' => $i-2,
        'A' => $A[$i],
        'C' => $C[$i],
        'T' => $T[$i],
        'G' => $G[$i],
        'N' => $N[$i]
    );
}

$response->success = true;
$response->message = "Data loaded";
$response->total = count($data);
$response->data = $data;
print_r($response->to_json());

?>
 