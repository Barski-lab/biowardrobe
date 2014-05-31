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

//logmsg($_REQUEST);

$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $response->print_error("Data is not set");

if (!$worker->isAdmin() && !$worker->isLocalAdmin())
    $response->print_error("Insufficient privileges");

class UpLab extends AbstractTableDataProcessing
{
    public function fieldrule($field, $value)
    {
        return false;
    }

    protected function where($field, $value)
    {
        global $worker;
        if ($field == "id" && $worker->isLocalAdmin())
            $this->setwhere($field, $worker->worker['laboratory_id'], " and {$field}=? ");
        return false;
    }
}

$uplab = new UpLab('laboratory');
$uplab->upData($data, 'id');
$uplab->exec();

$response->success = true;
$response->message = "Data updated";
$response->total = 1;
$response->data = $data;
print_r($response->to_json());

?>
