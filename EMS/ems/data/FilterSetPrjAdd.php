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
//logmsg(print_r($_REQUEST,true));
logmsg(print_r($data,true));



$V=$data->filters[0];

if(!isset($V->name) || !isset($V->conditions) || !isset($data->uuid) || !isset($data->project_id))
    $res->print_error("no data");
/**************************************************************
***************************************************************/
function get_extention($f){
    switch ($f) {
        case 2:
            return array("name"=>"RPKM genes","ext"=>"_genes");
        case 3:
            return array("name"=>"RPKM common tss","ext"=>"_common_tss");
    }
    return array("name"=>"RPKM isoforms","ext"=>"");
}

function get_field($f){
    switch($f) {
        case 1:
            return array("name"=>"RPKM","field"=>"RPKM_0");
        case 2:
            return array("name"=>"Chromosome","field"=>"chrom");
        case 3:
            return array("name"=>"Log Ratio","field"=>"LOGR");
        case 4:
            return array("name"=>"P-value","field"=>"pval");
        case 5:
            return array("name"=>"P-adjasted","field"=>"padj");
    }
}

function get_expression($f){
    switch ($f) {
        case 1:
            return array("name"=>"equal","exp"=>"=");
        case 2:
            return array("name"=>"not equal","exp"=>"<>");
        case 3:
            return array("name"=>"less than","exp"=>"<");
        case 4:
            return array("name"=>"less than or equal","exp"=>"<=");
        case 5:
            return array("name"=>"greater than","exp"=>">");
        case 6:
            return array("name"=>"greater than or equal","exp"=>">=");
    }
    $res->print_error("get expression error $f");
}

function get_operand($o){
    if($o==2)
        return " OR ";
    return " AND ";
}

function get_table_name($val) {
    global $con,$db_name_ems;
    $qr=execSQL($con,"select tableName,name from ".$db_name_ems.".genelist where id like ?",array("s",$val->table),false);
    return $qr;
}
/**************************************************************
***************************************************************/

$con=def_connect();
$con->select_db($db_name_ems);
$con->autocommit(FALSE);

$tablenames=array();

$c=0;

check_val($data->uuid);

$WHERE="0=0 ";
$FNAME=$V->name;
$EXT=get_extention(intval($V->annottype));
$UUID=$data->uuid;
$tbname=str_replace('-','',$UUID);
$project_id=intval($data->project_id);

$READABLE="";
$FROM="";
$RPKMS="";

foreach( $V->conditions as $k2 => $val ) {
    check_val($val->table);

    if(!isset($tablenames[$val->table])) {
        $tn=get_table_name($val);
        if(!$tn)
            $res->print_error("no tablename data");
        $tablenames[$val->table]=array("table"=>$tn[0]['tableName'],"alias"=>"a$c","name"=>$tn[0]['name']);

        if($c>0) {
            $WHERE=$WHERE." and a".($c-1).".refseq_id=a".$c.".refseq_id";
            $WHERE=$WHERE." and a".($c-1).".chrom=a".$c.".chrom";
            $WHERE=$WHERE." and a".($c-1).".txStart=a".$c.".txStart";
            $WHERE=$WHERE." and a".($c-1).".txEnd=a".$c.".txEnd";
            $WHERE=$WHERE." and a".($c-1).".strand=a".$c.".strand";
            $FROM=$FROM.",".$db_name_experiments.".".$tablenames[$val->table]['table'].$EXT['ext']." ".$tablenames[$val->table]['alias'];
            $RPKMS=$RPKMS.",".$tablenames[$val->table]['alias']."."."RPKM_0 as `RPKM ".$tablenames[$val->table]['name']."`";
        } else {
            $FROM=$db_name_experiments.".".$tablenames[$val->table]['table'].$EXT['ext']." ".$tablenames[$val->table]['alias'];
            $RPKMS=$tablenames[$val->table]['alias']."."."RPKM_0 as `RPKM ".$tablenames[$val->table]['name']."`";
        }
        $c++;
    }
    $exp=get_expression(intval($val->condition));
    $field=get_field(intval($val->field));
    $op=get_operand(intval($val->operand));

    if(intval($val->field)==2) {//chrom
        $WHERE=$WHERE." $op ".$tablenames[$val->table]['alias'].".".$field['field']." ".$exp['exp']." '".$val->value."'"; //replace potentioal injection !
    } else {
        $WHERE=$WHERE." $op ".$tablenames[$val->table]['alias'].".".$field['field']." ".$exp['exp']." ".floatval($val->value);
    }

    $READABLE=$READABLE."$op'".$tablenames[$val->table]['name']."' ".$field['name']." ".$exp['name']." ".floatval($val->value)."<br>\n";
}


//execSQL($con,"drop view if exists ".$db_name_experiments.".".$tbname,array(),true);

$SQL="CREATE VIEW ".$db_name_experiments.".".$tbname." AS ".
    "select a0.refseq_id as refseq_id,".
    "a0.gene_id AS gene_id,".
    "a0.chrom AS chrom,".
    "a0.txStart AS txStart,".
    "a0.txEnd AS txEnd,".
    "a0.strand AS strand,".
    $RPKMS.
    " FROM ".$FROM." WHERE ".$WHERE;
execSQL($con,$SQL,array(),true);

execSQL($con,"insert into ".$db_name_ems.".genelist (id,name,project_id,leaf,db,`type`,tableName) values(?,?,?,1,?,2,?)",
        array("ssiss",$UUID,$V->name,$project_id,$db_name_experiments,$tbname),true);

//logmsg(print_r($SQL,true));


if(!$con->commit()) {
    $res->print_error("Cant commit");
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = 1;
print_r($res->to_json());

?>
