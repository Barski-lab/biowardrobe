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

//logmsg($_REQUEST);

if (isset($_REQUEST['id']))
    $id = $_REQUEST['id'];
else
    $res->print_error('Not enough required parameters.');

check_val($id);

$con = def_connect();
$EDB = $settings->settings['experimentsdb']['value'];
$TMP = $settings->settings['wardrobe']['value'].'/'.$settings->settings['temp']['value'];;
$BIN = $settings->settings['wardrobe']['value'].'/'.$settings->settings['bin']['value'];;

//$con->select_db($db_name_experiments);

$record = get_table_info($id);
if (!$record)
    $res->print_error("no tablename data");

$tablename = $record[0]['tableName'];
$gblink = $record[0]['gblink'];
$db=$record[0]['db'];
$type=$record[0]['type'];

if(isset($type) && intval($type)==103) {
    $promoter = 0;
    if (isset($_REQUEST['promoter']))
        $promoter = $_REQUEST['promoter'];

    $describe = selectSQL("describe `{$EDB}`.`{$tablename}`", array());

    if ($describe[0]['Field'] != "refseq_id" || $promoter) {
        if (!$promoter) $promoter = 1000;
        ignore_user_abort(true);
        set_time_limit(600);
        $command = "{$BIN}/iaintersect -guid=\"{$id}\" -log=\"{$TMP}/iaintersect.log\" -promoter={$promoter}";
        exec($command, $output, $retval);
//        logmsg($command,$output,$retval);
        if ($retval != 0) {
            $response->print_error("Cant execute command " . print_r($output, true));
        }
    }

}


$total = selectSQL("SELECT COUNT(*) as count FROM `{$EDB}`.`$tablename` $where", array())[0]['count'];


$descr = selectSQL("describe `{$EDB}`.`$tablename`", array());
$fields = array();
foreach ($descr as $key => $val) {
    $type = "float";
    if (strpos($val['Type'], "int") !== false) $type = "int";
    elseif (strpos($val['Type'], "float") !== false) $type = "float";
    elseif (strpos($val['Type'], "varchar") !== false) $type = "string";
    else $type = "string";

    array_push($fields, array(
        "name" => $val['Field'],
        "type" => $type
    ));
}

//logmsg(print_r($fields, true));


$query_array = selectSQL("SELECT * FROM `{$EDB}`.`$tablename` $where $order $limit", array());
$con->close();

//logmsg(print_r($query_array,true));

$res->success = true;
$res->message = "Data loaded";
$res->extra = array("gblink"=>"db=$db&$gblink");
$res->total = $total;
$res->meta = array("fields" => $fields);
$res->data = $query_array;
print_r($res->to_json());
?>

