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

require_once('../settings.php');

try {
    $data = json_decode(file_get_contents('php://input'));
} catch (Exception $e) {
    $response->print_error("Cant read input" . $e);
}
//logmsg(print_r($data, true));


if (!isset($data->atype_id) || !isset($data->project_id) || !isset($data->R)) {
    $response->print_error("Not enough data");
}

if (gettype($data->R) == "array") {
    $response->print_error("Strange set.");
}


$EDB = $settings->settings['experimentsdb']['value'];
$TMP = $settings->settings['wardrobe']['value'] . '/' . $settings->settings['temp']['value'];;
$BIN = $settings->settings['wardrobe']['value'] . '/' . $settings->settings['bin']['value'];;
$path = $settings->settings['wardrobe']['value'] . $settings->settings['preliminary']['value'];

$atypeid = intval($data->atype_id);

check_val($data->project_id);
check_val($data->R->name);
check_val($data->R->rscript);


class Advanced extends AbstractTableDataProcessing {
    public function fieldrule($field, $value) {
        if ($field == "name" && strlen(trim($value)) == 0)
            $this->response->print_error("Name is empty");
        return false;
    }
}

$d = new stdClass();
$d->id = guid();
$d->project_id = $data->project_id;
$d->name = $data->R->name;
$d->atype_id=$data->atype_id;
$d->leaf = 1;
$d->type = 200;
$d->conditions = "Run R";

$Adv = new Advanced('genelist');
$Adv->addData($d);
$Adv->exec();


$path = $settings->settings['wardrobe']['value'] . $settings->settings['advanced']['value'];
$dir = $path . '/' . $d->id;

mkdir($dir, 0777);

$path_no_ext = $dir . '/' . $d->id;
$rfile = $path_no_ext . ".r";

$svgfile = $path_no_ext . "_%03d.png";
$svgmask = $path_no_ext . "_*.png";

$outfile = $path_no_ext . ".txt";
$errfile = $path_no_ext . "_error.txt";


$R = $data->R->args;
$rscriptid = $data->R->rscript;

$adv_r = selectSQL("SELECT rscript,lastmodified FROM `advanced_r` where id = ?", array("s", $rscriptid))[0];
//if(!$adv_r)
//    exit(0);

$rscript = $adv_r['rscript'];
$lastmodified = strtotime($adv_r['lastmodified']);

$refresh = 1;

$rargs="";
$tblinfos=[];
foreach ($R as $dum => $val) {
    $rargs.=$val->table." ";
    $tn = get_table_info($val->table);
    if (!$tn)
        $response->print_error("no tablename data");
    $tblinfos[]=$tn;
}


$R_path = "/usr/bin/env Rscript ";
$R_options = "--slave --vanilla --no-environ --no-site-file --no-init-file ";

$command = "{$R_path} {$R_options} {$rfile} {$rargs} >{$outfile} 2>{$errfile}";

if (strtoupper(substr(PHP_OS, 0, 5)) == "LINUX") {

}

$rcode = "
        args <- commandArgs(trailingOnly = TRUE)
        options(warn=-1)
        suppressMessages(library(wardrobe))
        png(filename='{$svgfile}',width=800,height=800)
        " . $rscript . "
        graphics.off()
        ";

$fp = fopen($rfile, "w+");
fwrite($fp, $rcode);
chmod($rfile, 0666);
fclose($fp);

$exec_result = shell_exec($command);

//$outstring = file($outfile);
//$errstring = file($errfile);

$malength = count($R);

$d->conditions=$command;
$d->tableName = $d->id;
$d->type = 300;
$Adv->upData($d, "id");
$Adv->exec();


$response->success = true;
$response->message = "Data loaded";
$response->total = 0; //$tbpairlen;
$response->data = array(); //$query_array;
print_r($response->to_json());

?>
