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
class Worker {
    private $response;
    public $worker, $group, $groups, $fields;

    function __construct($worker = "", $pass = "") {
        global $response;
        global $settings;

        $this->response = &$response;
        if (!isset($_SESSION["userinfo"]) && ($worker === "" || $pass === "")) {
            $this->response->print_error("Authorization required!");
        }
        $this->fetch_data($worker, $pass);
    }

    function fetch_data($worker, $pass, $force = false) {
        if (session_status() !== PHP_SESSION_ACTIVE)
            session_start();

        if (!isset($_SESSION["userinfo"]) || $force) {
            //Check if .$_SERVER['REMOTE_ADDR'] - address remote or local and add where clause to SQL
            $query = selectSQL("SELECT * from worker where worker=? and passwd is not NULL", array("s", $worker));
            if (count($query) != 1)
                $this->response->print_error("Cant select worker!");

            $this->worker = $query[0];
            foreach ($query[0] as $k => $v) {
                $this->fields[] = $k;
            }
            $this->fields[] = "fullname";
            $this->fields[] = "isa";
            $this->fields[] = "isla";
            $this->check_pass($pass);
            $this->journal_login();

            $_SESSION["userinfo"] = $query[0];
            $_SESSION["userinfo"]['fields'] = $this->fields;
        }
        $this->worker = $_SESSION["userinfo"];
        $this->fields = $this->worker['fields'];
        $this->primary_group();
        $this->groups();
        $this->worker['fullname'] = $this->worker['lname'] . ", " . $this->worker['fname'];
        $this->worker['isa'] = $this->isAdmin();
        $this->worker['isla'] = $this->isLocalAdmin();
    }

    function primary_group() {
        if (!isset($_SESSION["userinfo"]["group"])) {
            $query = selectSQL("SELECT * from laboratory where id=?", array("s", $this->worker['laboratory_id']));
            $_SESSION["userinfo"]["group"] = $query[0];
        }
        $this->group = $_SESSION["userinfo"]["group"];
        return $this->group;
    }

    function groups() {
        if (!isset($_SESSION["userinfo"]["groups"])) {
            $SQL_STR = "SELECT distinct l.id,l.name, l.description FROM laboratory l, egroup e, egrouprights er where (er.laboratory_id=? and egroup_id=e.id and e.laboratory_id=l.id) order by name";
            $query = selectSQL($SQL_STR, array("s", $this->worker['laboratory_id']));
            if ($query)
                $_SESSION["userinfo"]["groups"] = $query;
            else
                $_SESSION["userinfo"]["groups"] = array();
        }
        $this->groups = $_SESSION["userinfo"]["groups"];
        return $this->groups;
    }

    public function allgroups() {
        return array_merge(array($this->group), $this->groups);
    }

    public function isAdmin() {
        return ($this->group['id'] === 'laborato-ry00-0000-0000-000000000001');
    }

    public function isLocalAdmin() {
        return ($this->worker['admin'] === 1);
    }

    function journal_login() {
        global $settings;
        execSQL($settings->connection, "insert into login_journal (login) value(?)",
            array("s", $this->worker['lname'] . ", " . $this->worker['fname'] . ";" . $_SERVER['REMOTE_ADDR']), true);
    }

    public function check_pass($passwd) {
        $salt = $this->salt_pass(substr($this->worker['passwd'], 0, 64), $passwd);
        if ($salt != $this->worker['passwd']) {
            $this->response->print_error("Incorrect user name or password");
            exit();
        }
        return true;
    }

    function salt_pass($salt, $P) {
        $hash = $salt . $P;
        for ($i = 0; $i < 100000; $i++) {
            $hash = hash('sha256', $hash);
        }
        $hash = $salt . $hash;
        return $hash;
    }

    public function crypt_pass($U, $P) {
        $salt = hash('sha256', uniqid(mt_rand(), true) . strtolower($U));
        return $this->salt_pass($salt, $P);
    }

    public function tojson() {
        $line = array();
        for ($i = 0; $i < count($this->fields); $i++) {
//            switch($this->fields[$i]) {
//                case "passwd":
//                case "dnapass":
//                    break;
//            }
            if ($this->fields[$i] === "passwd")
                $line[$this->fields[$i]] = "";
            else if ($this->fields[$i] === "dnapass")
                if ($this->worker[$this->fields[$i]] != "")
                    $line[$this->fields[$i]] = "*****";
                else
                    $line[$this->fields[$i]] = "";

            else
                $line[$this->fields[$i]] = $this->worker[$this->fields[$i]];
        }
        $data[] = $line;
        $this->response->success = true;
        $this->response->message = "userinfo";
        $this->response->total = count($data);
        $this->response->data = $data;
        return $this->response->to_json();
    }

}


?>