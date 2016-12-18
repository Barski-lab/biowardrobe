<?php
/****************************************************************************
 **
 ** Copyright (C) 2016 Andrey Kartashov .
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

if (session_status() !== PHP_SESSION_ACTIVE)
    session_start();

require_once __DIR__ .'/settings.php';

require_once __DIR__ .'/utils/attempt.php';

require_once __DIR__ .'/utils/Users.php';

$data = json_decode(file_get_contents('php://input'));
if ($data) {
    if (!(isset($data->username) && isset($data->password) && $data->username != '' && $data->password != ''))
        $response->print_error('Not enough required parameters.');

    $worker = new Worker($data->username, $data->password);
} else {
    $worker = new Worker();
}

$_SESSION["timeout"] = time();
$_SESSION["attempt"] = 1;
