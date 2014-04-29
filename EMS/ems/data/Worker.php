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

require_once('../settings.php');

logmsg($_REQUEST);

if (isset($_REQUEST['workers']))
    $workers = $_REQUEST['workers'];

$array_prepend = array();
$PARAMS = array();

//Workers as workers list needed for editing only!
if (isset($workers)) {
//    $array_prepend[] = array('id' => 0, 'worker' => 'All', 'lname' => 'All');
    if ($worker->isAdmin()) {
        $SQL_STR = "SELECT id,worker,'*****' as passwd,fname,lname,dnalogin,'*****' as dnapass,email,notify,changepass,relogin,admin,laboratory_id FROM worker ";
        if (isset($_REQUEST['laboratory']) && $_REQUEST['laboratory'] != '00000000-0000-0000-0000-000000000000') {
            $PARAMS = array("s", $_REQUEST['laboratory']);
//            array_push($PARAMS, $_REQUEST['laboratory']);
//            $PARAMS[0] = $PARAMS[0] . "s";
            $SQL_STR = $SQL_STR . " where laboratory_id=?";
        }
    } elseif ($worker->isLocalAdmin()) {
        $SQL_STR = "SELECT id,worker,'*****' as passwd,fname,lname,email,notify,admin,changepass,relogin,laboratory_id FROM worker where laboratory_id=? ";
        $PARAMS = array("s", $worker->worker['laboratory_id']);
    } else {
        $response->print_error("Insufficient privileges!");
    }
} else {
    print_r($worker->tojson());
    exit();
}

//array_push($PARAMS, );
//$PARAMS[0] = $PARAMS[0] . "s";
//$SQL_STR = $SQL_STR . ",passwd=?";


$SQL_STR = $SQL_STR . " order by lname,fname";

$query_array = selectSQL($SQL_STR, $PARAMS);

$result = array_merge($array_prepend, $query_array);

$response->success = true;
$response->message = "Data loaded";
$response->total = count($result);
$response->data = $result;
print_r($response->to_json());


//    $SQL_STR="SELECT id,worker,fname,lname,dnalogin,dnapass,email,notify FROM `$tablename` where worker_id=?";
//    $PARAMS=array("i",$worker_id);

?>
