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

if(isset($_REQUEST['workers']))
    $workers = $_REQUEST['workers'];

$array_prepend=array();
if(isset($workers)) {
    $array_prepend[]=array('id'=>0,'lname'=>'All');
    $SQL_STR="SELECT id,worker,fname,lname,dnalogin,email,notify FROM worker order by lname,fname";
    $PARAMS=array();
    $query_array=selectSQL($SQL_STR,$PARAMS);


    $result=array_merge($array_prepend,$query_array);

    $resourse->success = true;
    $resourse->message = "Data loaded";
    $resourse->total = count($result);
    $resourse->data = $result;
    print_r($resourse->to_json());
} else {
//    $SQL_STR="SELECT id,worker,fname,lname,dnalogin,dnapass,email,notify FROM `$tablename` where worker_id=?";
//    $PARAMS=array("i",$worker_id);
    print_r($worker->tojson());
}

?>
