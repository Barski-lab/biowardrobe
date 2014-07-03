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

if (!$worker->isAdmin() && !$worker->isLocalAdmin()) {
    $response->print_error("Insufficient privileges");
}

if (isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters. t');

$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $res->print_error("Data is not set");

$AllowedTable = array("spikeins", "spikeinslist", "antibody", "crosslink", "experimenttype", "fragmentation", "genome", "info");


if (!in_array($tablename, $AllowedTable))
    $res->print_error('Table not in the list');

class AddData extends AbstractTableDataProcessing
{
    public function fieldrule($field, $value)
    {
        if (in_array($field, array("id"))) {
            if ($this->types[$field] == "s" && strlen($value) != 36)
                $this->add_sql($field, guid());
            return true;
        }
        return false;
    }
}

if (gettype($data) != "array")
    $data = array($data);

foreach ($data as $key => $val) {
    $adddata = new AddData($tablename);
    $adddata->addData($val);
    $adddata->exec();
}
$total = count($data);


$response->success = true;
$response->message = "Data inserted";
$response->total = $total;
$response->data = $query_array;
print_r($response->to_json());
?>
