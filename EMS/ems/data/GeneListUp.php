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


logmsg(__FILE__);
logmsg(print_r($_REQUEST,true));

$data = json_decode($_REQUEST['data']);

if (!isset($data))
    $res->print_error("no data");
logmsg(print_r($data,true));

$count = 1;

$con = def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

function make_a_view($id, $parentid, $add = true)
{
    global $con, $db_name_ems, $db_name_experiments;

    if ($add) {
        $qr = execSQL($con, "select tableName from " . $db_name_ems . ".genelist where id like ?", array("s", $parentid), false);
        if (!$qr) return;
        $tbname = $qr[0]['tableName'];

        $qr = execSQL($con, "select * from " . $db_name_ems . ".genelist where parent_id like ?", array("s", $parentid), false);
        if (!$qr) return;
        $c = 0;
        $AV_R = "a0.TOT_R_0";
        $AV_RP = "a0.RPKM_0";
        $TABLES = "";
        $gblink = "";
        $WHERE = "0=0";
        //logmsg(print_r($qr,true));

        foreach ($qr as $key => $val) {
            //logmsg(print_r($key,true));
            //logmsg(print_r($val,true));
            if ($c != 0) {
                $AV_R = $AV_R . "+a" . $c . ".TOT_R_0";
                $AV_RP = $AV_RP . "+a" . $c . ".RPKM_0";
                $TABLES = $TABLES . "," . $db_name_experiments . "." . $val['tableName'] . " a" . $c;
                $gblink = $gblink . "&" . $val['tableName'] . "=full";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".refseq_id=a" . $c . ".refseq_id";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".chrom=a" . $c . ".chrom";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".txStart=a" . $c . ".txStart";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".txEnd=a" . $c . ".txEnd";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".strand=a" . $c . ".strand";
            } else {
                $TABLES = $db_name_experiments . "." . $val['tableName'] . " a0";
                $gblink = $val['tableName'] . "=full";
            }
            $c++;
        }
        $AV_R = "(" . $AV_R . ")/" . $c;
        $AV_RP = "(" . $AV_RP . ")/" . $c;
        execSQL($con, "drop view if exists " . $db_name_experiments . "." . $tbname . "_genes", array(), true);
        execSQL($con, "drop view if exists " . $db_name_experiments . "." . $tbname . "_common_tss", array(), true);
        execSQL($con, "drop view if exists " . $db_name_experiments . "." . $tbname, array(), true);

        $SQL = "CREATE VIEW " . $db_name_experiments . "." . $tbname . " AS " .
            "select a0.refseq_id as refseq_id," .
            "a0.gene_id AS gene_id," .
            "a0.chrom AS chrom," .
            "a0.txStart AS txStart," .
            "a0.txEnd AS txEnd," .
            "a0.strand AS strand," .
            $AV_R . " AS TOT_R_0," .
            $AV_RP . " AS RPKM_0 " .
            "FROM " . $TABLES . " WHERE " . $WHERE;

        //logmsg(print_r($SQL,true));
        execSQL($con, $SQL, array(), true);

        $SQL = "CREATE VIEW " . $db_name_experiments . "." . $tbname . "_common_tss AS " .
            "select " .
            "group_concat(refseq_id  separator ',') AS refseq_id," .
            "group_concat(gene_id    separator ',') AS gene_id," .
            "chrom AS chrom," .
            "txStart AS txStart," .
            "txEnd AS txEnd," .
            "strand AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from " . $db_name_experiments . "." . $tbname .
            " where strand = '+' " .
            "group by chrom,txStart,strand " .
            " union " .
            "select " .
            "group_concat(refseq_id  separator ',') AS refseq_id," .
            "group_concat(gene_id    separator ',') AS gene_id," .
            "chrom AS chrom," .
            "txStart AS txStart," .
            "txEnd AS txEnd," .
            "strand AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from " . $db_name_experiments . "." . $tbname .
            " where strand = '-' " .
            "group by chrom,txEnd,strand ";
        execSQL($con, $SQL, array(), true);

        $SQL = "CREATE VIEW " . $db_name_experiments . "." . $tbname . "_genes AS " .
            "select " .
            "group_concat(refseq_id  separator ',') AS refseq_id," .
            "gene_id," .
            "chrom AS chrom," .
            "txStart AS txStart," .
            "txEnd AS txEnd," .
            "strand AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from " . $db_name_experiments . "." . $tbname .
            " group by gene_id ";
        execSQL($con, $SQL, array(), true);

        execSQL($con, "update " . $db_name_ems . ".genelist set gblink=? where id like ?",
            array("ss", $gblink, $parentid), true);

    }
    //if add
}

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
        $qr = execSQL($con, "select filename from labdata where id=?", array("i", $lid), false);
        $tb = explode(';', $qr[0]['filename']);
        $tablename = $tb[0];
        $gblink = $tablename . "=full";
    }

    if ($val->parentId == "gd") {
        if ($val->isnew)
            if ($val->leaf) //new record in a GD
            execSQL($con, "insert into " . $db_name_ems . ".genelist (id,name,project_id,leaf,db,labdata_id,tableName,gblink,conditions,`type`) values(?,?,?,1,'experiments',?,?,?,?,?)",
                array("sssisssi", $val->item_id, $val->name, $val->project_id, $lid, $tablename, $gblink,$val->conditions,$val->type), true);
            else { //new folder in GD
                $tbn = str_replace('-', '', $val->item_id);
                execSQL($con, "insert into " . $db_name_ems . ".genelist (id,name,project_id,leaf,db,tableName,`type`) values(?,?,?,0,'experiments',?,?)",
                    array("ssssi", $val->item_id, $val->name, $val->project_id, $tbn,$val->type), true);
            }
        else //move record to GD
        execSQL($con, "update " . $db_name_ems . ".genelist set name=?,parent_id=null,leaf=? where id like ?",
            array("sis", $val->name, $val->leaf, $val->item_id), true);
    } else {
        if ($val->isnew)
            if ($val->leaf) { //add record in a folder
                execSQL($con, "insert into " . $db_name_ems . ".genelist (id,name,project_id,leaf,parent_id,db,labdata_id,tableName,gblink,conditions,`type`) values(?,?,?,?,?,'experiments',?,?,?,?,?)",
                    array("sssisisssi", $val->item_id, $val->name, $val->project_id, $val->leaf, $val->parentId, $lid, $tablename, $gblink,$val->conditions,$val->type), true);
                make_a_view($val->item_id, $val->parentId);
            } else //looks like inccorect situation (add folder into folder)
            $res->print_error("Incorrect situation");

        //execSQL($con,"insert into ".$db_name_ems.".genelist (id,name,project_id,leaf,parent_id,db,`type`) values(?,?,?,?,?,'experiments',1)",
        //array("ssiis",$val->item_id,$val->name,$val->project_id,$val->leaf,$val->parentId),true);
        else //move record into folder
        execSQL($con, "update " . $db_name_ems . ".genelist set name=?,parent_id=?,leaf=? where id like ?",
            array("ssis", $val->name, $val->parentId, $val->leaf, $val->item_id), true);
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
        if ($val->parentId == "gl" || $val->parentId == "de") {
            update_gl_de($val);
        } else {
            update_insert($val);
        }
    }

    $retdata[] = array("id" => $val->item_id, "isnew" => false);
} else {
    $val = $data;
    if ($val->parentId == "gl" || $val->parentId == "de") {
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
