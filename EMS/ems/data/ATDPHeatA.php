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

if (isset($_REQUEST['id']))
    $uid = $_REQUEST['id'];
else
    $res->print_error('Not enough required parameters.');
check_val($uid);

$TMP = $settings->settings['wardrobe']['value'].'/'.$settings->settings['temp']['value'];;
$BIN = $settings->settings['wardrobe']['value'].'/'.$settings->settings['bin']['value'];;


$command = "{$BIN}/atdp --avd_guid=\"{$uid}\" -log=\"{$TMP}/atdpheat.log\" --avd_heat_window=\"400\" -sam_twicechr=\"chrX chrY\" -sam_ignorechr=\"chrM\" -avd_window=5000 -avd_smooth=200";

$output=shell_exec("$command 2>{$TMP}/atdpheatERROR.log");

if(strlen($output)==0)
    $output=shell_exec("cat ./jsons/data1.json 2>{$TMP}/atdpheatERROR.log");

print_r($output);

?>

