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

$data = json_decode($_REQUEST['data']);
if (!isset($data))
    $response->print_error("no data");
//logmsg(print_r($data,true));

$count = 1;
//check rights??

$path = $settings->settings['wardrobe']['value'] . $settings->settings['advanced']['value'];

function delete_dir($dir) {
    #$dir = 'samples' . DIRECTORY_SEPARATOR . 'sampledirtree';
    $it = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
    $files = new RecursiveIteratorIterator($it,
        RecursiveIteratorIterator::CHILD_FIRST);
    foreach($files as $file) {
        if ($file->isDir()){
            rmdir($file->getRealPath());
        } else {
            unlink($file->getRealPath());
        }
    }
    rmdir($dir);
}

function delete_record($id)
{
    global $settings,$path;
    $EDB = $settings->settings['experimentsdb']['value'];
    $con=$settings->connection;

    $qr = selectSQL("select tableName,type from genelist where id like ? and labdata_id is null and (`type`<>1 or leaf=0 )", array("s", $id));
    //logmsg(print_r($qr,true));
    if ($qr) {
        $tbname = $qr[0]['tableName'];
        if (strlen($tbname)>0) {
            execSQL($con, "drop view if exists `{$EDB}`.`" . $tbname . "_genes`", array(), true);
            execSQL($con, "drop view if exists `{$EDB}`.`" . $tbname . "_common_tss`", array(), true);
            execSQL($con, "drop view if exists `{$EDB}`.`" . $tbname."`", array(), true);
            execSQL($con, "drop table if exists `{$EDB}`.`" . $tbname."`", array(), true);
        }
        if ($qr[0]['type'] == 102) {
            execSQL($con, "delete from atdp where genelist_id like ?", array("s", $id), true);
        }

        if($qr[0]['type'] == 300) {
            $path_no_ext = $path . '/' . $id . '/';
            try {
                delete_dir($path_no_ext);
            }catch (Exception $e) {
                #echo 'Caught exception: ',  $e->getMessage(), "\n";
            }
        }


    }
    execSQL($con, "delete from genelist where id like ?", array("s", $id), true);
    if (!$qr)
        recreate_rna_views($val->item_id, $val->parentId);
}

$con = def_connect();
$con->autocommit(FALSE);

if (gettype($data) == "array") {
    foreach ($data as $key => $val) {
        if ($val->item_id == "root" || $val->item_id == "gl" || $val->item_id == "gd")
            $response->print_error("Cant delete");
        delete_record($val->item_id);
    }
} else {
    $val = $data;
    if ($val->item_id == "root" || $val->item_id == "gl" || $val->item_id == "gd")
        $response->print_error("Cant delete");

    delete_record($val->item_id);
}


if (!$con->commit()) {
    $response->print_error("Cant commit");
}

$con->close();

$response->success = true;
$response->message = "Data deleted";
$response->total = $count;
print_r($response->to_json());

?>
