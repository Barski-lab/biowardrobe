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

if(!$worker->isAdmin()) {
    $response->print_error("Insufficient privileges");
}

$data=json_decode($_REQUEST['data']);
if(!isset($data))
    $res->print_error("Data is not set");

class AddLab extends AbstractTableDataProcessing
{
    public function fieldrule($field,$value) {
        return false;
    }
}

$data->id = guid();
$addlab = new AddLab('laboratory');
$addlab->addData($data);
$addlab->exec();


$response->success = true;
$response->message = "Data saved";
$response->total = 1;
$response->data = $data;
print_r($response->to_json());

?>
