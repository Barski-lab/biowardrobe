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

$pair = $_REQUEST['pair'];

$path = $settings->settings['wardrobe']['value'] . $settings->settings['preliminary']['value'];
$file = "";
if ($pair) {
    $file = $path . '/' . $recordid . '/' . $recordid . '_2.fastxstat';
} else {
    $file = $path . '/' . $recordid . '/' . $recordid . '.fastxstat';
}
if (file_exists($file))
    $handle = fopen($file, "r");
else
    $handle = fopen("./fence.dat", "r");

$head = fgetcsv($handle, 2000, "\t");

//$data=array();
$data = array();
while (($line = fgetcsv($handle, 2000, "\t")) !== FALSE) {
    $data[] = array(
        'id' => $line[0],
        'min' => $line[2],
        'max' => $line[3],
        'mean' => $line[5],
        'Q1' => $line[6],
        'med' => $line[7],
        'Q3' => $line[8],
        'IQR' => $line[9],
        'lW' => $line[10],
        'rW' => $line[11],
        'A' => $line[12],
        'C' => $line[13],
        'G' => $line[14],
        'T' => $line[15],
        'N' => $line[16]
    );
}

$response->success = true;
$response->message = "Data loaded";
$response->total = count($data);
$response->data = $data;
print_r($response->to_json());

?>
 