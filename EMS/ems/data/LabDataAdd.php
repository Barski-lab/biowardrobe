<?php
/****************************************************************************
 **
 ** Copyright (C) 2011-2014 Andrey Kartashov .
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

//logmsg($_REQUEST);


if ($worker->isAdmin()) {
    $response->print_error("Insufficient privileges");
}


$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $res->print_error("Data is not set");


class AddLabData extends AbstractTableDataProcessing
{

    public function fieldrule($field,$value) {
        if (in_array($field, array("id","islandcount","browsergrp")))
            return true;

        if($field=="cells" && strlen(trim($value))==0)
            $this->response->print_error("Cells is empty");
        if($field=="conditions" && strlen(trim($value))==0)
            $this->response->print_error("Conditions is empty");

        return false;
    }
}

$data->uid = guid();
$data->laboratory_id=$worker->worker['laboratory_id'];
$data->author=$worker->worker['fullname'];
$data->worker_id=$worker->worker['id'];
$data->dateadd = date("m/d/Y");

$addlabdata = new AddLabData('labdata');
$addlabdata->addData($data);
$addlabdata->exec();

$path=$settings->settings['wardrobe']['value'].$settings->settings['preliminary']['value'];
$dir=$path.'/'.$data->uid;

mkdir($dir,0777);

$response->success = true;
$response->message = "Data inserted";
$response->total = $total;
$response->data = array();
print_r($response->to_json());
?>
