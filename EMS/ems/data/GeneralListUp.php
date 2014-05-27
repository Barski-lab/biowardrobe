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

require_once('../settings.php');

//logmsg($_REQUEST);

if (!$worker->isAdmin() && !$worker->isLocalAdmin())
    $response->print_error("Insufficient credentials");


if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $response->print_error('Not enough required parameters. t');

$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $res->print_error("Data is not set");

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "info", "settings");

if (!in_array($tablename, $AllowedTable))
    $response->print_error('Table not in the list');

class UpData extends AbstractTableDataProcessing
{
    public function fieldrule($field, $value)
    {
        switch ($this->tablename) {
            case "settings":
                if (in_array($field, array("description", "status","group")))
                    return true;
        }
        return false;
    }
}


if (gettype($data) != "array")
    $data = array($data);


foreach ($data as $key => $val) {
    $updata = new UpData($tablename);
    switch ($tablename) {
        case "settings":
            $updata->upData($val, 'key');
            break;
        default:
            $updata->upData($val, 'id');
            break;
    }
//    logmsg($updata);
    $updata->exec();
}
$total = count($data);


$response->success = true;
$response->message = "Data updated";
$response->total = $total;
$response->data = array();
print_r($response->to_json());
?>
