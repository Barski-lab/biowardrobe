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
class Worker
{
    private $response;
    public $worker, $group, $groups;

    function __construct($worker = "", $pass = "")
    {
        global $response;
        global $settings;

        $this->response = & $response;

        if (!isset($_SESSION["userinfo"])) {
            $query = selectSQL("SELECT * from worker where worker=? and passwd is not NULL", array("s", $worker));
            if (count($query) != 1)
                $this->response->print_error("Cant select worker!");

            $this->worker = $query[0];

            $this->check_pass($pass);
            $this->journal_login();

            $_SESSION["userinfo"]=$query[0];
        }
        $this->worker = $_SESSION["userinfo"];
        $this->worker['fullname']=$this->worker['lname'] . ", " . $this->worker['fname'];
        $this->primary_group();
    }

    public function primary_group()
    {
        if (!isset($_SESSION["userinfo"]["group"])) {
            $query = selectSQL("SELECT * from laboratory where id=?", array("s", $this->worker['laboratory_id']));
            $_SESSION["userinfo"]["group"] = $query[0];
        }
        $this->group = $_SESSION["userinfo"]["group"];
        return $this->group;
    }

    public function groups()
    {
        return $this->group;
    }

    public function isAdmin()
    {
        return ($this->group['id'] === 'laborato-ry00-0000-0000-000000000001');
    }

    public function isLocalAdmin()
    {
        return ($this->worker['admin'] === 1);
    }

    function journal_login()
    {
    }

    public function check_pass($passwd)
    {
        $salt=$this->salt_pass(substr($this->worker['passwd'], 0, 64), $passwd);
        if ($salt != $this->worker['passwd']) {
            $this->response->print_error("Incorrect user name or password");
            exit();
        }
        return true;
    }

    function salt_pass($salt, $P)
    {
        $hash = $salt . $P;
        for ($i = 0; $i < 100000; $i++) {
            $hash = hash('sha256', $hash);
        }
        $hash = $salt . $hash;
        return $hash;
    }

    public function crypt_pass($U, $P)
    {
        $salt = hash('sha256', uniqid(mt_rand(), true) . strtolower($U));
        return $this->salt_pass($salt, $P);
    }


}


?>