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

require_once('../auth.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));

if(!isset($_REQUEST["ahead_id"])) {
    $res->print_error("no data");
}

$count=0;

$con=def_connect();

$heads=execSQL($con,"select * from fhead where ahead_id=? and analysis_id is NULL;",array("i",$_REQUEST['ahead_id']),false);

$response=array();

if(count($heads)>0)
foreach( $heads as $key => $val ) {
    $count++;
    //logmsg(print_r($val,true));
    $filters=execSQL($con,"select * from filter where fhead_id=?;",array("i",$val['id']),false);
    $filter=array();
    foreach( $filters as $k => $v ) {
        array_push($filter,array(
        'operand'=>$v['operand'],
        'table'=>$v['tbl'],
        'field'=>$v['field'],
        'condition'=>$v['filter'],
        'value'=>$v['value']
        ));
    }
    array_push($response,array('name'=>$val['name'],'conditions'=>$filter));
}

$con->close();

$res->success = ($count>0);
$res->message = "Data loaded";
$res->total = $count;
$res->data=$response;
print_r($res->to_json());

?>
