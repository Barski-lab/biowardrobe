<?php

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
                if($val == null ) continue;
                switch($types[$key]) {
                    case 4:
                    case 5:
                        if($round!=0) {
                            $x[$key] = round($val,$round);
                        } else {
                            $x[$key] = $val;
                        }
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
            $result=array();
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
