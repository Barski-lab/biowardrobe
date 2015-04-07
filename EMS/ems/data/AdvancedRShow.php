<?php
/****************************************************************************
 **
 ** Copyright (C) 2011-2015 Andrey Kartashov.
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



/*
 *
 *
 *
 */
$UID = "";
if (isset($_REQUEST['UID']) && $_REQUEST['UID'] != "") {
    $UID = $_REQUEST['UID'];
    check_val($UID);
}


$path = $settings->settings['wardrobe']['value'] . $settings->settings['advanced']['value'];

$path_no_ext = $path . '/' . $UID . '/';

$svgmask = $path_no_ext . "*.png";
$allmask = $path_no_ext . "*";

$outfile = $path_no_ext . "${UID}.txt";
$errfile = $path_no_ext . "${UID}_error.txt";

$outstring = file($outfile);
$errstring = file($errfile);

$svgfiles = glob($svgmask);
$br = 0;
foreach ($svgfiles as $line_num => $line) {
    if ($br > 0 && $br % 2 == 0) {
        echo "<br>";
    }
    $br += 1;
    echo "<img src=\"" . str_replace($settings->settings['wardrobe']['value'], '', $line) . "?" . hash("md5", rand(1, 1000)) . "\" />";
}

if (count($outstring) > 0) {
    echo "<P>R output:<pre>";
    foreach ($outstring as $line_num => $line) {
        echo $line;
    }
    echo "</pre>";
}

if (count($errstring) > 0) {
    echo "<P> R errors:<pre>";
    foreach ($errstring as $line_num => $line) {
        echo $line;
    }
    echo "</pre>";
}


$allfiles = glob($allmask);
$br = 0;
echo "<P>All files in a directory:<br>";
foreach ($allfiles as $line_num => $line) {
    #echo "<img src=\"" . str_replace($settings->settings['wardrobe']['value'], '', $line) . "?" . hash("md5", rand(1, 1000)) . "\" />";
    echo "<a href=\"".str_replace($settings->settings['wardrobe']['value'], '', $line)."\" target=_blank>" .
        str_replace($path_no_ext, '', $line)."</a><br>";
}


?>

