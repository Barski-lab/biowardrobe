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
if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $response->print_error('Not enough required parameters.');

check_val($tablename);

$DB=$settings->settings['experimentsdb']['value'];


$total = selectSQL("SELECT COUNT(*) as count FROM `{$DB}`.`$tablename`",array())[0]['count'];
$query_array=selectSQL("SELECT * FROM `{$DB}`.`$tablename` limit 10",array());


foreach($query_array as $record) {
    $t=unpack('v*',$record['heat']);
    logmsg($t);
}

$response->meta=array( "fields"=>$fields );

$response->success = true;
$response->message = "Data loaded";
$response->total = sizeof($query_array);
$response->data = array();//$query_array;
print_r($response->to_json());
?>

