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
//logmsg(print_r($_REQUEST, true));

$data = json_decode($_REQUEST['data']);

if (!isset($data))
    $res->print_error("no data");
//logmsg(print_r($data, true));

$count = 1;

$con = def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);


//function

function update_insert($val)
{
    global $con, $res, $db_name_ems;
    if (isset($val->labdata_id) && intVal($val->labdata_id) > 0)
        $lid = intVal($val->labdata_id);
    else
        $lid = null;

    check_val($val->item_id);

    $tablename = "";
    $gblink = "";

    if ($val->isnew && $val->leaf) {
        $qr = execSQL($con, "select filename,g.db as db, etype from " . $db_name_ems . ".labdata l
        left join (" . $db_name_ems . ".genome g, " . $db_name_ems . ".experimenttype e) on (genome_id=g.id and experimenttype_id=e.id) where l.id=?", array("i", $lid), false);
        $tb = explode(';', $qr[0]['filename']);
        $tablename = $tb[0];
        $db = $qr[0]['db'];
        if (strpos($qr[0]['etype'], 'DNA') !== false) {
            $gblink = $tablename . "_grp=full";
        } else {
            $gblink = $tablename . "=full";
        }
    }

    if ($val->parentId == "gd") {
        if ($val->isnew)
            if ($val->leaf) //new record in a GD
            execSQL($con, "insert into " . $db_name_ems . ".genelist (id,name,project_id,leaf,db,labdata_id,tableName,gblink,conditions,`type`) values(?,?,?,1,'".$db."',?,?,?,?,?)",
                array("sssisssi", $val->item_id, $val->name, $val->project_id, $lid, $tablename, $gblink, $val->conditions, $val->type), true);
            else { //new folder in GD
                $tbn = str_replace('-', '', $val->item_id);
                execSQL($con, "insert into " . $db_name_ems . ".genelist (id,name,project_id,leaf,db,tableName,`type`) values(?,?,?,0,'".$db."',?,?)",
                    array("ssssi", $val->item_id, $val->name, $val->project_id, $tbn, $val->type), true);
            }
        else //move record to GD
        execSQL($con, "update " . $db_name_ems . ".genelist set name=?,parent_id=null,leaf=? where id like ?",
            array("sis", $val->name, $val->leaf, $val->item_id), true);
    } else {
        if ($val->isnew)
            if ($val->leaf) { //add record in a folder
                execSQL($con, "insert into " . $db_name_ems . ".genelist (id,name,project_id,leaf,parent_id,db,labdata_id,tableName,gblink,conditions,`type`) values(?,?,?,?,?,'".$db."',?,?,?,?,?)",
                    array("sssisisssi", $val->item_id, $val->name, $val->project_id, $val->leaf, $val->parentId, $lid, $tablename, $gblink, $val->conditions, $val->type), true);
            } else //looks like inccorect situation (add folder into folder)
            $res->print_error("Incorrect situation");

        //execSQL($con,"insert into ".$db_name_ems.".genelist (id,name,project_id,leaf,parent_id,db,`type`) values(?,?,?,?,?,'experiments',1)",
        //array("ssiis",$val->item_id,$val->name,$val->project_id,$val->leaf,$val->parentId),true);
        else { //move record into folder
            $qr = execSQL($con, "select parent_id from " . $db_name_ems . ".genelist where id=?", array("s", $val->item_id), false);
            execSQL($con, "update " . $db_name_ems . ".genelist set name=?,parent_id=?,leaf=? where id like ?",
                array("ssis", $val->name, $val->parentId, $val->leaf, $val->item_id), true);
            if ($qr && strlen($qr[0]['parent_id']) > 2) {
                recreate_rna_views($val->item_id, $qr[0]['parent_id']);
            }
        }
        recreate_rna_views($val->item_id, $val->parentId);
    }
}

function update_gl_de($val)
{
    global $con, $db_name_ems;
    check_val($val->item_id);
    execSQL($con, "update " . $db_name_ems . ".genelist set name=? where id like ?",
        array("ss", $val->name, $val->item_id), true);
}

$retdata = array();

if (gettype($data) == "array") {
    foreach ($data as $key => $val) {
        if ($val->parentId == "root")
            continue;

        if (in_array($val->parentId, array('gl', 'de', 'ar', 'ma'))) {
            //if ($val->parentId == "gl" || $val->parentId == "de") {
            update_gl_de($val);
        } else {
            update_insert($val);
        }
    }

    $retdata[] = array("id" => $val->item_id, "isnew" => false);
} else {
    $val = $data;
    if (in_array($val->parentId, array('gl', 'de', 'ar', 'ma'))) {
        update_gl_de($val);
    } else
        if ($val->parentId != "root")
            update_insert($val);

    $retdata[] = array("id" => $val->item_id, "isnew" => false);
}


if (!$con->commit()) {
    //logmsg(print_r('Cant commit',true));
    $res->print_error("Cant commit");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = count($retdata);
$res->data = $retdata;
print_r($res->to_json());

?>
