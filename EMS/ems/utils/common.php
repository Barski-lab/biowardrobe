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

function logmsg($log_string, $obj = "")
{
    if ($obj != "") {
        error_log("\n" . $log_string . "\n" . print_r($obj, true), 3, '/tmp/php.log');
    } else {
        error_log("\n" . $log_string, 3, '/tmp/php.log');
    }
}

function require_authentication()
{
    global $settings,$worker;

    if (!isset($_SESSION["timeout"]) || $_SESSION["timeout"] == "") {
        header("Location:" . $settings->settings['wardroberoot']['value'] . "/login.php");
        exit();
    }
    if ($_SESSION["timeout"] + 4000 < time()) {
        header("Location:" . $settings->settings['wardroberoot']['value'] . "/login.php?timeout=true");
        exit();
    }
    $_SESSION["timeout"] = time();
    $worker = new Worker();
}

function guid()
{
    if (function_exists('com_create_guid')) {
        return trim(com_create_guid(), '{}');
    } else {
        mt_srand((double)microtime() * 10000); //optional for php 4.2.0 and up.
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45); // "-"
        $uuid =
            substr($charid, 0, 8) . $hyphen
            . substr($charid, 8, 4) . $hyphen
            . substr($charid, 12, 4) . $hyphen
            . substr($charid, 16, 4) . $hyphen
            . substr($charid, 20, 12);
        return $uuid;
    }
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

?>
