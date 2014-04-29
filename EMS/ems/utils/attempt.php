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

if (!isset($_SESSION["attempt"])) $_SESSION["attempt"] = 0;

$_SESSION["attempt"] = intVal($_SESSION["attempt"]) + 1;

if ($_SESSION["attempt"] > 30) {
    if (!isset($_SESSION["attempttime"])) $_SESSION["attempttime"] = time();
    $diff = time() - $_SESSION["attempttime"];
    if ($diff < 300) {
        $response->print_error("You should wait " . intVal(((300 - $diff) / 60)) . " min, before next attempt");
    } else {
        $_SESSION["attempt"] = 1;
    }
}

?>
 