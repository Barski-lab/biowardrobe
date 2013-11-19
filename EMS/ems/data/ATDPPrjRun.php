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

ignore_user_abort(true);
set_time_limit(600);

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

//logmsg(__FILE__);

try {
    $data = json_decode(file_get_contents('php://input'));
} catch (Exception $e) {
    $res->print_error("Cant read input" . $e);
}
//logmsg(print_r($data, true));
$count = 0;

if (!isset($data->project_id) || !isset($data->atdp) || !isset($data->name)) {
    $res->print_error("no data");
}

check_val($data->project_id);
$projectid = $data->project_id;

$NAME = $data->name;

$atdp = $data->atdp;
$delength = count($atdp);

if ($delength < 1) {
    $res->print_error("Is it me who post this?");
}

$con = def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

$UUID = guid();

execSQL($con,
    "insert into " . $db_name_ems . ".genelist (id,name,project_id,db,leaf,`type`) values(?,?,?,?,1,102)",
    array("ssss", $UUID, $NAME, $projectid, $db_name_experiments), true);

for ($i = 0; $i < $delength; $i++) {
    check_val($atdp[$i]->tableD);
    check_val($atdp[$i]->tableL);
    execSQL($con,
        "insert into " . $db_name_ems . ".atdp (genelist_id,tbl1_id,tbl2_id,pltname) values(?,?,?,?)",
        array("ssss", $UUID, $atdp[$i]->tableD, $atdp[$i]->tableL, $atdp[$i]->pltname), true);
}

if (!$con->commit()) {
    $res->print_error("Cant commit");
}

$command="/usr/local/bin/averagedensity -avd_id=$UUID -sql_host=localhost -sql_user=\"$db_user\" -sql_pass=\"$db_pass\" -sql_dbname=\"$db_name_ems\" -sam_twicechr=\"chrX chrY\" -sam_ignorechr=\"chrM\" -avd_window=5000 -avd_smooth=200 -log=\"/tmp/AverageTagDensity.log\"";
//-plot_ext="svg" -gnuplot="/usr/local/bin/gnuplot"
exec("$command",$output,$retval);
if($retval!=0)
    $res->print_error("Cant execute averagedensity command");

execSQL($con,
    "update " . $db_name_ems . ".genelist set tableName = ? where id like ?",
    array("ss",str_replace("-","",$UUID),$UUID), true);


if (!$con->commit()) {
    $res->print_error("Cant commit");
}

$con->close();

$res->success = true;
$res->message = "Data loaded";
$res->total = $tbpairlen;
//$res->data = $query_array;
print_r($res->to_json());

?>
