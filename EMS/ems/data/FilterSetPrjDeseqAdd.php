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


//logmsg(__FILE__);

try {
    $data = json_decode(file_get_contents('php://input'));
} catch (Exception $e) {
    $response->print_error("Cant read input" . $e);
}
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data, true));


$V = $data->filters[0];

if (!isset($V->name) || !isset($V->conditions) || !isset($data->uuid) || !isset($data->project_id))
    $response->print_error("no data");
/**************************************************************
 ***************************************************************/

function get_field($f)
{
    global $response;
    switch ($f) {
        case 1:
            return array("name" => "P-value", "field" => "pvalue");
        case 2:
            return array("name" => "Log2 Ratio", "field" => "LOGR");
        case 3:
            return array("name" => "P-adjasted", "field" => "padj");
        case 4:
            return array("name" => "RPKM1", "field" => "RPKM");
        case 5:
            return array("name" => "RPKM2", "field" => "RPKM");
        case 6:
            return array("name" => "Chromosome", "field" => "chrom");
    }
    $response->print_error("Error field");
}

$con = def_connect();
$con->autocommit(FALSE);
$EDB = $settings->settings['experimentsdb']['value'];

$tablenames = array();

$c = 0;

check_val($data->uuid);

if (intval($V->nr) == 1) {
    $WHERE = " a0.refseq_id like 'NM\\_%' ";
} else {
    $WHERE = "0=0 ";
}
$WHEREC = "";

$EXT = get_extension(intval($V->annottype));
$UUID = $data->uuid;
$tbname = str_replace('-', '', $UUID);
check_val($data->project_id);
$project_id = $data->project_id;

$READABLE = $EXT['name'] . " were used <br>";
$FROM = "";
$FIELDS = "";
$gblink = "";
$retdata = array();
$DB="";

foreach ($V->conditions as $k2 => $val) {
    check_val($val->table);
    if (($val->bracketl != '' && $val->bracketl != '(') || ($val->bracketr != '' && $val->bracketr != ')'))
        $response->print_error("Paranthesis error");

    if (!isset($tablenames[$val->table])) {
        $tn = get_table_info($val->table);
        if (!$tn)
            $response->print_error("no tablename data");
        if ($tn[0]['rtype_id'] != $EXT['id'])
            $response->print_error("Incorrect annotation grouping");

        $descr = execSQL($con, "describe `{$EDB}`.`" . $tn[0]['tableName'] . "`", array(), false);
        if (!$descr)
            $response->print_error("no tablename data");

        $tablenames[$val->table] = array("table" => $tn[0]['tableName'], "alias" => "a$c", "name" => $tn[0]['name'], "RPKM1" => $descr[6]['Field'], "RPKM2" => $descr[7]['Field']);
        if ($c > 0) {
            $WHEREC = $WHEREC . " and a" . ($c - 1) . ".refseq_id=a" . $c . ".refseq_id";
            $WHEREC = $WHEREC . " and a" . ($c - 1) . ".chrom=a" . $c . ".chrom";
            $WHEREC = $WHEREC . " and a" . ($c - 1) . ".txStart=a" . $c . ".txStart";
            $WHEREC = $WHEREC . " and a" . ($c - 1) . ".txEnd=a" . $c . ".txEnd";
            $WHEREC = $WHEREC . " and a" . ($c - 1) . ".strand=a" . $c . ".strand";
            $FROM = $FROM . ",`{$EDB}`." . $tablenames[$val->table]['table'] . " " . $tablenames[$val->table]['alias'];

            $FIELDS = $FIELDS . "," . $tablenames[$val->table]['alias'] . "." . $tablenames[$val->table]['RPKM1'] . " as `" . $c . $tablenames[$val->table]['RPKM1'] ."`".
                "," . $tablenames[$val->table]['alias'] . "." . $tablenames[$val->table]['RPKM2'] . " as `" . $c . $tablenames[$val->table]['RPKM2'] ."`".
                "," . $tablenames[$val->table]['alias'] . "." . "LOGR as `LOG2R " . $tablenames[$val->table]['name'] . "`" .
                "," . $tablenames[$val->table]['alias'] . "." . "pvalue as `pvalue " . $tablenames[$val->table]['name'] . "`" .
                "," . $tablenames[$val->table]['alias'] . "." . "padj as `padj " . $tablenames[$val->table]['name'] . "`";


            $gblink = $gblink . "&" . $tn[0]['gblink'];
        } else {
            $FROM = "`{$EDB}`." . $tablenames[$val->table]['table'] . " " . $tablenames[$val->table]['alias'];
            $FIELDS = $tablenames[$val->table]['alias'] . "." . $tablenames[$val->table]['RPKM1'] . "," .
                $tablenames[$val->table]['alias'] . "." . $tablenames[$val->table]['RPKM2'] . "," .
                $tablenames[$val->table]['alias'] . "." . "LOGR as `LOG2R " . $tablenames[$val->table]['name'] . "`," .
                $tablenames[$val->table]['alias'] . "." . "pvalue as `pvalue " . $tablenames[$val->table]['name'] . "`," .
                $tablenames[$val->table]['alias'] . "." . "padj as `padj " . $tablenames[$val->table]['name'] . "`";
            $gblink = $tn[0]['gblink'];
            $DB=$tn[0]['db'];
        }
        $c++;
    }

    $field = get_field(intval($val->field));
    $exp = get_expression(intval($val->condition), $field['field'] == "chrom");
    $op = get_operand(intval($val->operand));

    if ($field['field'] == "chrom") { //chrom
        $WHERE = $WHERE . " $op " . $val->bracketl . $tablenames[$val->table]['alias'] . "." . $field['field'] . " " . $exp['exp'] . " '" . $val->value . "'" . $val->bracketr; //replace potentioal injection !
        $READABLE = $READABLE . "$op $val->bracketl'" . $tablenames[$val->table]['name'] . "' " . $field['name'] . " " . $exp['name'] . " " . $val->value . "$val->bracketr<br>\n";
    } else {
        if ($field['field'] == "RPKM") { //RPKM 1/2
            $WHERE = $WHERE . " $op " . $val->bracketl . $tablenames[$val->table]['alias'] . ".`" . $tablenames[$val->table][$field['name']] . "` " . $exp['exp'] . " " . floatval($val->value) . "" . $val->bracketr;
        } else {
            $WHERE = $WHERE . " $op " . $val->bracketl . $tablenames[$val->table]['alias'] . "." . $field['field'] . " " . $exp['exp'] . " " . floatval($val->value) . "" . $val->bracketr;
        }
        $READABLE = $READABLE . "$op $val->bracketl'" . $tablenames[$val->table]['name'] . "' " . $field['name'] . " " . $exp['name'] . " " . floatval($val->value) . "$val->bracketr<br>\n";
    }

}

$WHERE=str_replace('0=0   AND','0=0 AND (',$WHERE);
$WHERE.=") ";

$SQL = "CREATE VIEW `{$EDB}`.`{$tbname}` AS " .
    "select a0.refseq_id as refseq_id," .
    "a0.gene_id AS gene_id," .
    "a0.chrom AS chrom," .
    "a0.txStart AS txStart," .
    "a0.txEnd AS txEnd," .
    "a0.strand AS strand," .
    $FIELDS .
    " FROM " . $FROM . " WHERE $WHERE $WHEREC ";
execSQL($con, $SQL, array(), true);
//logmsg(print_r($SQL,true));
execSQL($con, "insert into " . $db_name_ems . ".genelist (id,name,project_id,leaf,db,`type`,tableName,gblink,conditions,rtype_id) values(?,?,?,1,?,2,?,?,?,?)",
    array("sssssssi", $UUID, $V->name, $project_id, $DB, $tbname, $gblink, $READABLE, $EXT['id']), true);

if (!$con->commit()) {
    $response->print_error("Cant commit");
}

$con->close();


$response->success = true;
$response->message = "Data loaded";
$response->total = 1;
$response->data = array("id" => $UUID, "conditions" => $READABLE, "gblink" => $gblink);
print_r($response->to_json());

?>
