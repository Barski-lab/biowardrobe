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

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));

$data=json_decode($_REQUEST['data']);

if(!isset($data))
    $res->print_error("no data");
//logmsg(print_r($data,true));

$count=1;
//check rights??

function delete_record ($id) {
    global $con,$db_name_ems,$db_name_experiments;
    $qr=execSQL($con,"select tableName from ".$db_name_ems.".genelist where id like ? and labdata_id is null and (`type`<>1 or leaf=0 )",array("s",$id),false);
    //logmsg(print_r($qr,true));
    if($qr) {
        $tbname=$qr[0]['tableName'];
        execSQL($con,"drop view if exists ".$db_name_experiments.".".$tbname."_genes",array(),true);
        execSQL($con,"drop view if exists ".$db_name_experiments.".".$tbname."_common_tss",array(),true);
        execSQL($con,"drop view if exists ".$db_name_experiments.".".$tbname,array(),true);
        execSQL($con,"drop table if exists ".$db_name_experiments.".".$tbname,array(),true);
    }
    execSQL($con,"delete from ".$db_name_ems.".genelist where id like ?",array("s",$id),true);
}

$con=def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

if(gettype($data)=="array") {
    foreach($data as $key => $val ) {
        if($val->item_id=="root" || $val->item_id=="gl" || $val->item_id=="gd")
            $res->print_error("Cant delete");
        delete_record($val->item_id);
    }
} else {
    $val=$data;
    if($val->item_id=="root" || $val->item_id=="gl" || $val->item_id=="gd")
        $res->print_error("Cant delete");

    delete_record($val->item_id);
}


if(!$con->commit()) {
    $res->print_error("Cant commit");
}

$con->close();

$res->success = true;
$res->message = "Data deleted";
$res->total = $count;
print_r($res->to_json());

?>
