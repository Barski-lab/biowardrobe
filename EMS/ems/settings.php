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

$DATABSE_CONNECTION_FILE = "/etc/wardrobe/wardrobe";

require_once('utils/response.php');
require_once('utils/def_vars.php');

require_once('utils/common.php');
require_once('utils/Users.php');

$response = new Response();
$res = & $response;

Class Settings
{
    public  $settings, $connection;
    private $fields, $response;
    public  $db_host, $db_user, $db_pass, $db_name;

    function __construct()
    {
        global $response, $DATABSE_CONNECTION_FILE;
        $this->response = & $response;
        $handle = fopen($DATABSE_CONNECTION_FILE, "r");
        if ($handle) {
            $this->db_host = "";
            $this->db_name = "";
            $this->db_user = "";
            $this->db_pass = "";
            while (($line = fgets($handle)) !== false) {
                $line = trim($line, "\n\r\t");
                if (strpos($line, "#") === 0)
                    continue;
                if (strlen($line) === 0)
                    continue;
                if ($this->db_host === "") {
                    $this->db_host = $line;
                } else
                    if ($this->db_user === "") {
                        $this->db_user = $line;
                    } else
                        if ($this->db_pass === "") {
                            $this->db_pass = $line;
                        } else
                            if ($this->db_name === "") {
                                $this->db_name = $line;
                            }
            }
        } else {
            $response->print_error("Cant open file: " . print_r(error_get_last(), true));
        }
        fclose($handle);
        $this->def_connect();
        $this->get_settings();
    }

    function def_connect()
    {
        $con = new mysqli($this->db_host, $this->db_user, $this->db_pass, $this->db_name);
        if ($con->connect_errno)
            $this->response->print_error('Could not connect: ' . $con->connect_error);
        if (!$con->set_charset("utf8")) {
            $this->response->print_error("Error loading character set utf8:" . $con->error);
        }
        $this->connection = $con;
    }

    function get_settings()
    {
        $query = execSQL($this->connection, "select * from settings order by `group`", array(), false);
        foreach ($query[0] as $k => $v) {
            $this->fields[] = $k;
        }
        foreach ($query as $val) {
            $this->settings[$val[$this->fields[0]]] = array();
            for ($i = 1; $i < count($this->fields); $i++) {
                $this->settings[$val[$this->fields[0]]][$this->fields[$i]] = $val[$this->fields[$i]];
            }
        }
    }

    public function tojson()
    {
        foreach ($this->settings as $key => $val) {
            $line = array();
            $line[$this->fields[0]] = $key;
            for ($i = 1; $i < count($this->fields); $i++) {
                $line[$this->fields[$i]] = $val[$this->fields[$i]];
            }
            $data[] = $line;
        }
        $this->response->success = true;
        $this->response->message = "Settings";
        $this->response->total = count($data);
        $this->response->data = $data;
        return $this->response->to_json();

    }

}

session_start();
require_once('utils/attempt.php');
$settings = new Settings();
//FIXME:remove this function later
function def_connect()
{
    global $settings;
    return $settings->connection;
}

if (isset($_SESSION["authorizing"]) && $_SESSION["authorizing"] != 1) {
    $worker = new Worker();
    $_SESSION["attempt"] = 1;
    session_write_close();
}
//logmsg("settings", $settings);
//logmsg("worker", $worker);
?>