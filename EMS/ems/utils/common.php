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

function logmsg()
{
    $numargs = func_num_args();
    $arg_list = func_get_args();
    $final = "";
    $backtrace = debug_backtrace();
    $last = $backtrace[0];

    for ($i = 0; $i < $numargs; $i++) {
        if (gettype($arg_list[$i]) == "string") {
            $final = $final . $arg_list[$i];
        } else {
            $final = $final . print_r($arg_list[$i], true);
        }
    }
    error_log("\n" . $last['file'] . "\n" . $final, 3, '/tmp/php.log');
}

//function require_authentication()
//{
//    global $settings,$worker,$authorize;
//
//    if (!isset($_SESSION["timeout"]) || $_SESSION["timeout"] == "") {
////        header("Location:" . $settings->settings['wardroberoot']['value'] . "/login.php");
////        exit();
//        $authorize=1;
//    }else
//    if ($_SESSION["timeout"] + 4000 < time()) {
////        header("Location:" . $settings->settings['wardroberoot']['value'] . "/login.php?timeout=true");
//        $authorize=2;
////        exit();
//    } else {
//        $_SESSION["timeout"] = time();
//        $worker = new Worker();
//        $authorize=0;
//    }
//}

function guid()
{
    $possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    $uuid="";
    mt_srand((double)microtime() * 10000); //optional for php 4.2.0 and up.
    if (function_exists('com_create_guid')) {
        $uuid=trim(com_create_guid(), '{}');
    } else {
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45); // "-"
        $uuid =
            substr($charid, 0, 8) . $hyphen
            . substr($charid, 8, 4) . $hyphen
            . substr($charid, 12, 4) . $hyphen
            . substr($charid, 16, 4) . $hyphen
            . substr($charid, 20, 12);
    }
    $uuid[0]=$possible{rand(0,strlen($possible))};
    return $uuid;
}

function execSQL($mysqli, $sql, $params, $affectedrows, $round = 3)
{
    global $response;
    if (!$stmt = $mysqli->prepare($sql)) {
        $response->print_error("Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error);
    }

    if (count($params) > 0)
        if (!call_user_func_array(array($stmt, 'bind_param'), refValues($params))) {
            $response->print_error("Bind failed: (" . $mysqli->errno . ") " . $mysqli->error);
        }

    if (!$stmt->execute()) {
        $response->print_error("Exec failed: (" . $mysqli->errno . ") " . $mysqli->error);
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

function selectSQL($sql, $params = array())
{
    global $settings;
    return execSQL($settings->connection, $sql, $params, false, 0);
}

abstract class AbstractTableDataProcessing
{
    public $response, $types, $PARAMS, $VARIABLES, $tablename, $SQL_STR, $ID, $IDTYPE, $IDNAME, $wheres, $wherep;

    function __construct($_table)
    {
        global $response;
        global $settings;

        $this->response = & $response;
        $this->tablename = $_table;

        if (($table = selectSQL("describe `$_table`", array())) == 0)
            $this->response->print_error("Cant describe");

        $this->types = array();
        foreach ($table as $dummy => $val) {
            $t = "s";
            if (strrpos($val["Type"], "int") !== false)
                $t = "i";
            elseif (strrpos($val["Type"], "float") !== false)
                $t = "d";
            elseif (strrpos($val["Type"], "double") !== false)
                $t = "d";
            elseif (strrpos($val["Type"], "date") !== false)
                $t = "dd";

            $this->types[$val["Field"]] = $t;
        }
        $this->PARAMS[] = "";
        $this->wherep[] = "";
        $this->VARIABLES = "";
        $this->SQL_STR = "";
    }

    abstract protected function fieldrule($field, $value);

    protected function add_sql($field, $value)
    {
        $this->SQL_STR .= "{$field},";
        if ($value == NULL)
            $this->VARIABLES .= "null,";
        else {
            $this->VARIABLES .= "?,";
            $this->PARAMS[] = $value;
            $this->PARAMS[0] .= $this->types[$field];
        }
    }

    protected function up_sql($field, $value, $inject = false)
    {
        if ($inject) {
            $this->SQL_STR .= "{$field}{$value}";
        } else {
            if ($value == NULL)
                $this->SQL_STR .= "{$field}=null,";
            else {
                $this->SQL_STR .= "{$field}=?,";
                $this->PARAMS[] = $value;
                $this->PARAMS[0] .= $this->types[$field];
            }
        }
    }

    public function addData($val)
    {
        foreach ($val as $f => $d) {

            if (!array_key_exists($f, $this->types))
                $this->response->print_error("Table field does not exist $f");

            if ($this->types[$f] == "s")
                $d = trim($d);

            if ($this->fieldrule($f, $d))
                continue;

            if (strrpos($f, "_id") !== false && (($this->types[$f] == "i" && intVal($d) == 0) || ($this->types[$f] == "s" && strlen($d) == 0))) {
                $this->SQL_STR .= " $f,";
                $this->VARIABLES .= "null,";
                continue;
            }

            $this->SQL_STR .= " $f,";
            $this->VARIABLES .= "?,";

            if ($this->types[$f] == "dd") {
                $date = DateTime::createFromFormat('m/d/Y', $d);
                $this->PARAMS[] = $date->format('Y-m-d');
                $this->PARAMS[0] .= "s";
            } else {
                $this->PARAMS[] = $d;
                $this->PARAMS[0] .= $this->types[$f];
            }
        }

        $this->SQL_STR = substr_replace($this->SQL_STR, "", -1);
        $this->VARIABLES = substr_replace($this->VARIABLES, "", -1);

        $this->SQL_STR = "insert into `{$this->tablename}` ({$this->SQL_STR}) VALUES({$this->VARIABLES})";
    }

    public function upData($val, $idfield)
    {
        $this->IDNAME = $idfield;
        foreach ($val as $f => $d) {

            if (!array_key_exists($f, $this->types))
                $this->response->print_error("Table field does not exist $f");

            if ($this->types[$f] == "s")
                $d = trim($d);

            if ($this->fieldrule($f, $d))
                continue;

            if ($this->where($f, $d))
                continue;

            if ($f == $this->IDNAME) {
                $this->ID = $d;
                $this->IDTYPE = $this->types[$f];
                continue;
            }

            if (strrpos($f, "_id") !== false && (($this->types[$f] == "i" && intVal($d) == 0) || ($this->types[$f] == "s" && strlen($d) == 0))) {
                $this->SQL_STR .= " $f=null,";
                continue;
            }

            $this->SQL_STR .= " $f=?,";

            if ($this->types[$f] == "dd") {
                $date = DateTime::createFromFormat('m/d/Y', $d);
                $this->PARAMS[] = $date->format('Y-m-d');
                $this->PARAMS[0] .= "s";
            } else {
                $this->PARAMS[] = $d;
                $this->PARAMS[0] .= $this->types[$f];
            }
        }


        $this->SQL_STR = substr_replace($this->SQL_STR, "", -1);

        $this->PARAMS[] = $this->ID;
        $this->PARAMS[0] .= $this->IDTYPE;

        $this->SQL_STR = "update `{$this->tablename}` set {$this->SQL_STR} where `{$this->IDNAME}`=? ";

        if (count($this->wherep) > 1) {
            for ($i = 1; $i < count($this->wherep); $i++)
                $this->PARAMS[] = $this->wherep[$i];
            $this->PARAMS[0].=$this->wherep[0];
            $this->SQL_STR.=$this->wheres;
        }
    }

    protected function where($field, $value)
    {
        return false;
    }

    protected function setwhere($field, $value, $sql)
    {
        $this->wheres .= $sql;
        $this->wherep[] = $value;
        $this->wherep[0] .= $this->types[$field];
    }

    public function exec()
    {
        global $settings;
        return execSQL($settings->connection, $this->SQL_STR, $this->PARAMS, true);
    }
}

require_once('database_connection.php');

?>
