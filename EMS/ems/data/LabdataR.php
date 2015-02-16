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

$codetype=1;
if (isset($_REQUEST['codetype']) && $_REQUEST['codetype']!="") {
    $codetype = intval($_REQUEST['codetype']);
}


$rscript="";

if($UID != "" && $codetype == 2) {
    $query = selectSQL("SELECT * FROM `labdata_r` where id = ?", array('s', $UID));
    if($query[0]['rscript']=="") {
        $query=array("id"=>$UID,"rscript"=>"");
    }
} else if ($codetype == 1) {
    $query = selectSQL("SELECT * FROM `labdata_r` where id like 'default0-0000-0000-0000-000000000001'", array());
} else {
    $response->print_error('Not enough required parameters.');
}

//if($query[0]['rscript']=="") {
//    $response->print_error('No data.');
//}

$response->success = true;
$response->message = "Data loaded";
$response->total = count($query);
$response->data = $query;
print_r($response->to_json());
?>

