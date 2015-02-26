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

$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $res->print_error("Data is not set");


class UpLabData extends AbstractTableDataProcessing
{
    public function fieldrule($field, $value)
    {
        global $worker;
        if ($field == "cells" && strlen(trim($value)) == 0)
            $this->response->print_error("Cells is empty");
        if ($field == "conditions" && strlen(trim($value)) == 0)
            $this->response->print_error("Conditions is empty");
        if ($field == "forcerun" && intval($value)>0) {
            if ($worker->isLocalAdmin() || $worker->isAdmin()) {
                /*
                $this->up_sql("libstatus=IF(libstatus<10,libstatus,10),","", true);
                $this->setwhere("libstatus", 10, " and ((libstatus > ? and libstatus not between 1000 and 1009 and libstatus not between 2000 and 2009) or forcerun=1)");
                $this->up_sql("libstatustxt","ready to be analyzed");
                */
                $this->up_sql("forcerun",1);
            }
            return true;
        }

        if (in_array($field, array("author", "browsergrp", "uid", "islandcount", "filename", "deleted","libstatus","libstatustxt")))
            return true;

        return false;
    }

    protected function where($field, $value)
    {
        global $worker;
        if ($worker->isAdmin())
            return false;
        if ($field == "") {
            $this->setwhere("laboratory_id", $worker->worker['laboratory_id'], " and laboratory_id=? ");
            return true;
        }
        return false;
    }

}

$uplabdata = new UpLabData('labdata');
$uplabdata->upData($data, 'id');
$uplabdata->exec();


$response->success = true;
$response->message = "Data updated";
$response->total = 1;
$response->data = array();
print_r($response->to_json());
?>
