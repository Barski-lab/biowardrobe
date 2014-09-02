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

ignore_user_abort(true);
set_time_limit(600);

ini_set('memory_limit', '-1');


$window = 400;



$response->success = true;
$response->message = "Data loaded";
//$response->total = sizeof($data);
//$response->data = array("max" => $max, "cols" => $cols, "rows" => $rows, "array" => $data); //array("y" => $y);
//logmsg($response->to_json());
print_r($response->to_json());

?>

