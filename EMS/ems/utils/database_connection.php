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

/*
execSQL("SELECT * FROM table WHERE id = ?", array('i', $id), false);
execSQL("SELECT * FROM table", array(), false);
execSQL("INSERT INTO table(id, name) VALUES (?,?)", array('ss', $id, $name), true);
*/


/**************************************************************
 ***************************************************************/

function get_extension($f)
{
    switch ($f) {
        case 2:
            return array("name" => "genes", "ext" => "_genes", "id" => $f);
        case 3:
            return array("name" => "common tss", "ext" => "_common_tss", "id" => $f);
    }
    return array("name" => "isoforms", "ext" => "_isoforms", "id" => $f);
}

function get_expression($f, $d = false)
{
    global $response;
    switch ($f) {
        case 1:
            if ($d) {
                return array("name" => "equal", "exp" => " like ");
            } else {
                return array("name" => "equal", "exp" => "=");
            }
        case 2:
            if ($d) {
                return array("name" => "not equal", "exp" => " not like ");
            } else {
                return array("name" => "not equal", "exp" => "<>");
            }
        case 3:
            return array("name" => "less than", "exp" => "<");
        case 4:
            return array("name" => "less than or equal", "exp" => "<=");
        case 5:
            return array("name" => "greater than", "exp" => ">");
        case 6:
            return array("name" => "greater than or equal", "exp" => ">=");
    }
    $response->print_error("get expression error $f");
}

function get_operand($o)
{
    if ($o == 2)
        return " OR ";
    return " AND ";
}

function get_table_info($val)
{
    $qr = selectSQL("select tableName,name,gblink,rtype_id,upper(author) as worker,fragmentsize,etype,COALESCE(ge.db,g.db) as db,ge.annottable as annotation,l.uid as uid from genelist g
     left join (labdata l,experimenttype e,genome ge)
     on (labdata_id=l.id and l.genome_id=ge.id and l.experimenttype_id=e.id)
     where g.id like ?", array("s", $val), false);

    return $qr;
}

function recreate_rna_views($id, $parentid, $add = true)
{
    global $settings;//$db_name_ems, $db_name_experiments;
    $EDB = $settings->settings['experimentsdb']['value'];
    $con=$settings->connection;

    if ($add) {
        $qr = selectSQL("select tableName from genelist where id like ?", array("s", $parentid));
        if (!$qr) return;
        $tbname = $qr[0]['tableName'];

        execSQL($con, "drop view if exists {$EDB}.`" . $tbname . "_genes`", array(), true);
        execSQL($con, "drop view if exists {$EDB}.`" . $tbname . "_common_tss`", array(), true);
        execSQL($con, "drop view if exists {$EDB}.`" . $tbname . "`", array(), true);

        $qr = selectSQL("select * from genelist where parent_id like ?", array("s", $parentid));
        if (!$qr) {
            return;
        }

        $c = 0;
        $AV_R = "a0.TOT_R_0";
        $AV_RP = "a0.RPKM_0";
        $TABLES = "";
        $gblink = "";
        $db = "";
        $WHERE = "0=0";
        //logmsg(print_r($qr,true));

        foreach ($qr as $key => $val) {
            //logmsg(print_r($key,true));
            //logmsg(print_r($val,true));
            if ($c != 0) {
                $AV_R = $AV_R . "+a" . $c . ".TOT_R_0";
                $AV_RP = $AV_RP . "+a" . $c . ".RPKM_0";
                $TABLES = $TABLES . ",{$EDB}.`" . $val['tableName'] . "_isoforms` a" . $c;
                $gblink = $gblink . "&" . str_replace('-','_',$val['tableName']) . "=full";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".refseq_id=a" . $c . ".refseq_id";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".chrom=a" . $c . ".chrom";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".txStart=a" . $c . ".txStart";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".txEnd=a" . $c . ".txEnd";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".strand=a" . $c . ".strand";
            } else {
                $db = selectSQL("select g.db as db from genome g,labdata l where l.genome_id=g.id and l.id = ?", array("i", $val['labdata_id']));

                $TABLES = "{$EDB}.`" . $val['tableName'] . "_isoforms` a0";
                $gblink = str_replace('-','_',$val['tableName']) . "=full";
            }
            $c++;
        }
        $AV_R = "(" . $AV_R . ")/" . $c;
        $AV_RP = "(" . $AV_RP . ")/" . $c;
//Possible _isoforms
        $SQL = "CREATE VIEW `{$EDB}`.`" . $tbname . "` AS " .
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

        $SQL = "CREATE VIEW `{$EDB}`.`" . $tbname . "_common_tss` AS " .
            "select " .
            "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id," .
            "group_concat(distinct gene_id order by gene_id separator ',') AS gene_id," .
            "chrom AS chrom," .
            "txStart AS txStart," .
            "max(txEnd) AS txEnd," .
            "strand AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from `{$EDB}`.`" . $tbname . "` where strand = '+' " .
            "group by chrom,txStart,strand " .
            " union " .
            "select " .
            "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id," .
            "group_concat(distinct gene_id order by gene_id separator ',') AS gene_id," .
            "chrom AS chrom," .
            "min(txStart) AS txStart," .
            "txEnd AS txEnd," .
            "strand AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from `{$EDB}`.`" . $tbname . "` where strand = '-' " .
            "group by chrom,txEnd,strand ";
        execSQL($con, $SQL, array(), true);

        $SQL = "CREATE VIEW `{$EDB}`.`" . $tbname . "_genes` AS " .
            "select " .
            "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id," .
            "gene_id," .
            "max(chrom) AS chrom," .
            "max(txStart) AS txStart," .
            "max(txEnd) AS txEnd," .
            "max(strand) AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from `{$EDB}`.`" . $tbname . "` group by gene_id ";
        execSQL($con, $SQL, array(), true);

        execSQL($con, "update genelist set gblink=?,db=? where id like ?",
            array("sss", $gblink, $db, $parentid), true);

    }
    //if add
}

/**************************************************************
 ***************************************************************/

/*
numerics
-------------
BIT: 16
TINYINT: 1
BOOL: 1
SMALLINT: 2
MEDIUMINT: 9
INTEGER: 3
BIGINT: 8
SERIAL: 8
FLOAT: 4
DOUBLE: 5
DECIMAL: 246
NUMERIC: 246
FIXED: 246

dates
------------
DATE: 10
DATETIME: 12
TIMESTAMP: 7
TIME: 11
YEAR: 13

strings & binary
------------
CHAR: 254
VARCHAR: 253
ENUM: 254
SET: 254
BINARY: 254
VARBINARY: 253
TINYBLOB: 252
BLOB: 252
MEDIUMBLOB: 252
TINYTEXT: 252
TEXT: 252
MEDIUMTEXT: 252
LONGTEXT: 252
  */

?>
