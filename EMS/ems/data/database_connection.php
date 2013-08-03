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

function def_connect() {
    global $db_host,$db_user,$db_pass,$res ;
    $con = new mysqli($db_host,$db_user,$db_pass);
    if ($con->connect_errno)
        $res->print_error('Could not connect: ' . $con->connect_error);
    /* change character set to utf8 */
    if (!$con->set_charset("utf8")) {
        $res->print_error("Error loading character set utf8:". $con->error);
    }
    return $con;
}

function def_mssql_connect() {
    global $db_host_mssql,$db_user_mssql,$db_pass_mssql, $res;

    $con = mssql_connect($db_host_mssql,$db_user_mssql,$db_pass_mssql);
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

function execSQL($mysqli,$sql, $params, $close,$round=3){
    global $res;

    if (!$stmt = $mysqli->prepare($sql)) {
        $res->print_error("Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error);
    }

    if(count($params)>0)
        if(! call_user_func_array(array($stmt, 'bind_param'), refValues($params))) {
            $res->print_error("Bind failed: (" . $mysqli->errno . ") " . $mysqli->error);
        }

    if (!$stmt->execute()) {
        $res->print_error("Exec failed: (" . $mysqli->errno . ") " . $mysqli->error);
    }

    if($close){
        $result = $mysqli->affected_rows;
    } else {
        $meta = $stmt->result_metadata();

        while ( $field = $meta->fetch_field() ) {
            $parameters[] = &$row[$field->name];
            $types[$field->name] = $field->type;
        }

        call_user_func_array(array($stmt, 'bind_result'), refValues($parameters));
        while ( $stmt->fetch() ) {
            $x = array();
            foreach( $row as $key => $val ) {
                switch($types[$key]) {
                    case 4:
                    case 5:
                        if($round!=0) {
                            $x[$key] = round($val,$round);
                        } else {
                            $x[$key] = $val;
                        }
                    break;
                    case 252:
                    case 253:
                    case 254:
                        if($val == null ) continue;
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
        if(isset($results)) {
            $result = $results;
        } else {
            $result=0;
        }
    }

    $stmt->close();
    return  $result;
}

function refValues($arr){
    if (strnatcmp(phpversion(),'5.3') >= 0) //Reference is required for PHP 5.3+
    {
        $refs = array();
        foreach($arr as $key => $value)
        $refs[$key] = &$arr[$key];
        return $refs;
    }
    return $arr;
}

/**************************************************************
***************************************************************/

function get_extention($f){
    switch ($f) {
        case 2:
            return array("name"=>"genes","ext"=>"_genes","id"=>$f);
        case 3:
            return array("name"=>"common tss","ext"=>"_common_tss","id"=>$f);
    }
    return array("name"=>"isoforms","ext"=>"","id"=>$f);
}

function get_expression($f,$d=false){
    switch ($f) {
        case 1:
            if($d) {
                return array("name"=>"equal","exp"=>" like ");
            }else{
                return array("name"=>"equal","exp"=>"=");
            }
        case 2:
            if($d) {
                return array("name"=>"not equal","exp"=>" not like ");
            } else {
                return array("name"=>"not equal","exp"=>"<>");
            }
        case 3:
            return array("name"=>"less than","exp"=>"<");
        case 4:
            return array("name"=>"less than or equal","exp"=>"<=");
        case 5:
            return array("name"=>"greater than","exp"=>">");
        case 6:
            return array("name"=>"greater than or equal","exp"=>">=");
    }
    $res->print_error("get expression error $f");
}

function get_operand($o){
    if($o==2)
        return " OR ";
    return " AND ";
}

function get_table_name($val) {
    global $con,$db_name_ems;
    $qr=execSQL($con,"select tableName,name,gblink,rtype_id from ".$db_name_ems.".genelist where id like ?",array("s",$val),false);
    return $qr;
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
