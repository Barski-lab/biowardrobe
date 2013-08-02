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

ignore_user_abort(true);
set_time_limit(600);

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

logmsg(__FILE__);

try {
    $data = json_decode(file_get_contents('php://input'));
}  catch(Exception $e) {
    $res->print_error("Cant read input".$e);
}
logmsg(print_r($data,true));

$count=0;

if( !isset($data->atype_id) || !isset($data->project_id) || !isset($data->deseq) || !isset($data->deseq->name)) {
    $res->print_error("no data");
}

$atypeid=intval($data->atype_id);
$projectid=intval($data->project_id);


if(gettype($data->deseq)=="array") {
    $res->print_error("Not supported yet.");
}

$NAME=$data->deseq->name;
$rtypeid=intVal($data->deseq->annottype);

$deseq=$data->deseq->deseq;
$delength=count($deseq);

if($delength<2) {
    $res->print_error("Is it me who post this?");
}

$con=def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

$tablepairs=array();

check_val($deseq[0]->table);
$tn=get_table_name($deseq[0]->table);
if(!$tn)
    $res->print_error("no tablename data");
$tablenames[$deseq[0]->table]=array("table"=>$tn[0]['tableName'],"gblink"=>$tn[0]['gblink'],"name"=>$tn[0]['name']);
if(intval($deseq[0]->order)!=1)
    $res->print_error("Incorrect ordering.");

for($i=1; $i<$delength; $i++) {
    check_val($deseq[$i]->table);
    $tn=get_table_name($deseq[$i]->table);
    if(!$tn)
        $res->print_error("no tablename data");
    $tablenames[$deseq[$i]->table]=array("table"=>$tn[0]['tableName'],"gblink"=>$tn[0]['gblink'],"name"=>$tn[0]['name']);

    $tablepairs[]=array("id"=>$i,"t1"=>$deseq[$i-1]->table,"t2"=>$deseq[$i]->table);

    if( intval($deseq[$i]->order) != $i+1 )
        $res->print_error("Incorrect ordering.");
}

$tbpairlen=count($tablepairs);

$gblink="";
$READABLE="";

for($i=0;$i<$tbpairlen;$i++) {
    set_time_limit(300);
    $UUID=guid();
    $TNAME=str_replace("-","",$UUID);
    $RNAME=$NAME;
    $CMD="Rscript DESeqN.R $db_user $db_pass $db_name_experiments $db_host $db_name_ems ".$tablepairs[$i]['t1']." ".$tablepairs[$i]['t2']." $rtypeid $TNAME";
    exec($CMD ,$output,$retval);
    if($tbpairlen!=1) {
        $c=$i+1;
        $RNAME=$NAME." ($c)";
    }
    if($retval!=0) {
        $res->print_error("Cant execute R. ".print_r($output,true));
        logmsg(print_r($output,true));
    }

    $gblink=$tablenames[$tablepairs[$i]['t1']]['gblink']."&".$tablenames[$tablepairs[$i]['t2']]['gblink'];
    $EXT=get_extention($rtypeid);
    $READABLE="Annotation grouping (".$EXT['name'].") were used for DESeq analysis.<br> Data from ".
    "'".$tablenames[$tablepairs[$i]['t1']]['name']."' and '".$tablenames[$tablepairs[$i]['t2']]['name']."' has been chosen.";

    execSQL($con,
    "insert into ".$db_name_ems.".genelist (id,name,project_id,leaf,db,`type`,tableName,gblink,conditions,rtype_id,atype_id) values(?,?,?,1,?,3,?,?,?,?,?)",
            array("ssissssii",$UUID,$RNAME,$projectid,$db_name_experiments,$TNAME,$gblink,$READABLE,$rtypeid,$atypeid),true);
}

/*
//$data->id;//] => 0
//$data->name; //] => PCA1_result
//$data->description;//] => PCA1_result
//$data->rtype_id;//] => 0
//$data->atype_id;//] => 2
//$data->ahead_id;//] => 1
//$data->labdata_id;//] => 0
//$data->project_id;//] => 1

*/

if(!$con->commit()) {
    $res->print_error("Cant commit");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $tbpairlen;
//$res->data = $query_array;
print_r($res->to_json());

?>
