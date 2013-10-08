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

include('/etc/settings/config.php');

require_once('response.php');

function def_connect()
{
    global $db_host, $db_user, $db_pass, $res;
    $con = new mysqli($db_host, $db_user, $db_pass);
    if ($con->connect_errno)
        $res->print_error('Could not connect: ' . $con->connect_error);
    /* change character set to utf8 */
    if (!$con->set_charset("utf8")) {
        $res->print_error("Error loading character set utf8:" . $con->error);
    }
    return $con;
}

function def_mssql_connect()
{
    global $db_host_mssql, $db_user_mssql, $db_pass_mssql, $res;

    $con = mssql_connect($db_host_mssql, $db_user_mssql, $db_pass_mssql);
    if (!$con)
        $res->print_error('Could not connect');
    //. mssql_get_last_message()
    return $con;
}

/*
execSQL("SELECT * FROM table WHERE id = ?", array('i', $id), false);
execSQL("SELECT * FROM table", array(), false);
execSQL("INSERT INTO table(id, name) VALUES (?,?)", array('ss', $id, $name), true);
*/

function execSQL($mysqli, $sql, $params, $affectedrows, $round = 3)
{
    global $res;

    if (!$stmt = $mysqli->prepare($sql)) {
        $res->print_error("Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error);
    }

    if (count($params) > 0)
        if (!call_user_func_array(array($stmt, 'bind_param'), refValues($params))) {
            $res->print_error("Bind failed: (" . $mysqli->errno . ") " . $mysqli->error);
        }

    if (!$stmt->execute()) {
        $res->print_error("Exec failed: (" . $mysqli->errno . ") " . $mysqli->error);
    }

    if ($affectedrows) {
        $result = $mysqli->affected_rows;
    } else {
        $meta = $stmt->result_metadata();

        while ($field = $meta->fetch_field()) {
            $parameters[] = & $row[$field->name];
            $types[$field->name] = $field->type;
        }

        call_user_func_array(array($stmt, 'bind_result'), refValues($parameters));
        while ($stmt->fetch()) {
            $x = array();
            foreach ($row as $key => $val) {
                switch ($types[$key]) {
                    case 4:
                    case 5:
                        if ($round != 0) {
                            $x[$key] = round($val, $round);
                        } else {
                            $x[$key] = $val;
                        }
                        break;
                    case 252:
                    case 253:
                    case 254:
                        if ($val == null) continue;
                        $x[$key] = $val;
                        break;
                    case 10:
                        $date = DateTime::createFromFormat('Y-m-d', $val);
                        $x[$key] = $date->format('m/d/Y');
                        break;
                    default:
                        $x[$key] = $val;
                        break;
                }
            }
            $results[] = $x;
        }
        if (isset($results)) {
            $result = $results;
        } else {
            $result = 0;
        }
    }

    $stmt->close();
    return $result;
}

function refValues($arr)
{
    if (strnatcmp(phpversion(), '5.3') >= 0) //Reference is required for PHP 5.3+
    {
        $refs = array();
        foreach ($arr as $key => $value)
            $refs[$key] = & $arr[$key];
        return $refs;
    }
    return $arr;
}

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
    return array("name" => "isoforms", "ext" => "", "id" => $f);
}

function get_expression($f, $d = false)
{
    global $res;
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
    $res->print_error("get expression error $f");
}

function get_operand($o)
{
    if ($o == 2)
        return " OR ";
    return " AND ";
}

function get_table_info($val)
{
    global $con, $db_name_ems;
    $qr = execSQL($con, "select tableName,name,gblink,rtype_id,upper(worker) as worker,fragmentsize,etype,ge.db from " . $db_name_ems . ".genelist g
     left join (" . $db_name_ems . ".labdata l," . $db_name_ems . ".worker w," . $db_name_ems . ".experimenttype e, " . $db_name_ems . ".genome ge)
     on (labdata_id=l.id and worker_id=w.id and l.genome_id=ge.id and l.experimenttype_id=e.id)
     where g.id like ?", array("s", $val), false);

    return $qr;
}

function recreate_rna_views($id, $parentid, $add = true)
{
    global $con, $db_name_ems, $db_name_experiments;

    if ($add) {
        $qr = execSQL($con, "select tableName from " . $db_name_ems . ".genelist where id like ?", array("s", $parentid), false);
        if (!$qr) return;
        $tbname = $qr[0]['tableName'];

        execSQL($con, "drop view if exists " . $db_name_experiments . ".`" . $tbname . "_genes`", array(), true);
        execSQL($con, "drop view if exists " . $db_name_experiments . ".`" . $tbname . "_common_tss`", array(), true);
        execSQL($con, "drop view if exists " . $db_name_experiments . ".`" . $tbname . "`", array(), true);

        $qr = execSQL($con, "select * from " . $db_name_ems . ".genelist where parent_id like ?", array("s", $parentid), false);
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
                $TABLES = $TABLES . "," . $db_name_experiments . ".`" . $val['tableName'] . "` a" . $c;
                $gblink = $gblink . "&" . $val['tableName'] . "=full";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".refseq_id=a" . $c . ".refseq_id";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".chrom=a" . $c . ".chrom";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".txStart=a" . $c . ".txStart";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".txEnd=a" . $c . ".txEnd";
                $WHERE = $WHERE . " and a" . ($c - 1) . ".strand=a" . $c . ".strand";
            } else {
                $db = execSQL($con, "select g.db as db from " . $db_name_ems . ".genome g," .
                    $db_name_ems . ".labdata l where l.genome_id=g.id and l.id = ?", array("i", $val['labdata_id']), false);

                $TABLES = $db_name_experiments . ".`" . $val['tableName'] . "` a0";
                $gblink = $val['tableName'] . "=full";
            }
            $c++;
        }
        $AV_R = "(" . $AV_R . ")/" . $c;
        $AV_RP = "(" . $AV_RP . ")/" . $c;

        $SQL = "CREATE VIEW " . $db_name_experiments . ".`" . $tbname . "` AS " .
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

        $SQL = "CREATE VIEW " . $db_name_experiments . ".`" . $tbname . "_common_tss` AS " .
            "select " .
            "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id," .
            "group_concat(distinct gene_id order by gene_id separator ',') AS gene_id," .
            "chrom AS chrom," .
            "txStart AS txStart," .
            "max(txEnd) AS txEnd," .
            "strand AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from " . $db_name_experiments . ".`" . $tbname . "` where strand = '+' " .
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
            "from " . $db_name_experiments . ".`" . $tbname . "` where strand = '-' " .
            "group by chrom,txEnd,strand ";
        execSQL($con, $SQL, array(), true);

        $SQL = "CREATE VIEW " . $db_name_experiments . ".`" . $tbname . "_genes` AS " .
            "select " .
            "group_concat(distinct refseq_id order by refseq_id separator ',') AS refseq_id," .
            "gene_id," .
            "max(chrom) AS chrom," .
            "max(txStart) AS txStart," .
            "max(txEnd) AS txEnd," .
            "max(strand) AS strand," .
            "coalesce(sum(TOT_R_0),0) AS TOT_R_0, " .
            "coalesce(sum(RPKM_0),0) AS RPKM_0 " .
            "from " . $db_name_experiments . ".`" . $tbname . "` group by gene_id ";
        execSQL($con, $SQL, array(), true);

        execSQL($con, "update " . $db_name_ems . ".genelist set gblink=?,db=? where id like ?",
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
