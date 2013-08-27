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

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');


$con = def_connect();
$con->select_db($db_name_ems);

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST,true));
//logmsg(print_r($data,true));

if (!isset($_REQUEST['projectid']))
    $res->print_error("Not enough arguments.");
check_val($_REQUEST['projectid']);

$prjid = $_REQUEST['projectid'];

if (!isset($_REQUEST['atypeid']) || intVal($_REQUEST['atypeid']) == 0)
    $res->print_error("Not enough arguments.");
$atypeid = intVal($_REQUEST['atypeid']);

$user_id = $_SESSION["user_id"];

if (!isset($_REQUEST['node'])) {
    $res->print_error("Not enough arguments.");
}
$node = $_REQUEST['node'];


function make_array($qr)
{
    $data = array();
    foreach ($qr as $key => $val) {
        $data[] = array(
            'item_id' => $val['id'],
            'id' => $val['id'],
            'name' => $val['name'],
            'leaf' => !!$val['leaf'],
            'conditions' => $val['conditions'],
            'tableName' => $val['tableName'],
            'expanded' => false,
            'type' => $val['type'],
            'labdata_id' => $val['labdata_id'],
            'rtype_id' => $val['rtype_id'],
            'atype_id' => $val['atype_id'],
            'project_id' => $val['project_id'],
            'parent_id' => isset($val['parent_id']) ? $val['parent_id'] : 0
        );
    }
    return $data;
}

/**************************************************************************
 * @param $parentid
 * @return array
 */
function get_by_id($parentid)
{
    global $con;
    $qr = execSQL($con, "select * from genelist where parent_id like ? order by name", array("s", $parentid), false);
    return make_array($qr);
}

/**************************************************************************
 * @param $prjid
 * @param int $type
 * @return array
 */
function get_raw_list($prjid, $type = 1)
{
    global $con;
    $qr = execSQL($con, "select * from genelist where project_id like ? and `type` = ? and parent_id is null order by leaf,name", array("si", $prjid, $type), false);
    return array(
        'id' => 'gd',
        'name' => 'Raw Data',
        'leaf' => false,
        'expanded' => true,
        'parent_id' => 'root',
        'data' => make_array($qr));
}

/**************************************************************************
 * @param $prjid
 * @param int $type
 * @param bool $expanded
 * @return array
 ***************************************************************************/
function get_list_by_type($prjid, $type = 2, $id, $name, $expanded = true)
{
    global $con;
    $qr = execSQL($con, "select * from genelist where project_id like ? and `type` = ? order by name", array("si", $prjid, $type), false);
    return array(
        'id' => $id,
        'name' => $name,
        'leaf' => false,
        'expanded' => $expanded,
        'parent_id' => 'root',
        'data' => make_array($qr));
}
/**************************************************************************
 *
 **************************************************************************/


if ($node == 'root') {
    switch ($atypeid) {
        case 1: //deseq
        case 3: //deseq2
        case 6: //filters
            $gl = get_list_by_type($prjid, 2, 'gl', 'Gene List');
            $rd = get_raw_list($prjid, 1);
            if ($atypeid == 1 || $atypeid == 3) {
                $de = get_list_by_type($prjid, 3, 'de', 'DESeq results');
                echo json_encode(array(
                    'text' => '.',
                    'expanded' => true,
                    'data' => array($rd, $de, $gl)
                ));
            } else {
                //break;
                echo json_encode(array(
                    'text' => '.',
                    'expanded' => true,
                    'data' => array($rd, $gl)
                ));
            }
            break;
        case 4: //ATDP
            $gl = get_list_by_type($prjid, 2, 'gl', 'Gene List', false);
            $rd = get_raw_list($prjid, 101);
            $ar = get_list_by_type($prjid, 102, 'ar', 'ATDP results');
            echo json_encode(array(
                'text' => '.',
                'expanded' => true,
                'data' => array($rd, $ar, $gl)
            ));
            break;
    }
}

if ($node == 'de') {
    $de=get_list_by_type($prjid, 3, 'de', 'DESeq results');
    echo json_encode(array(
        'text' => '.',
        'expanded' => true,
        'data' => $de['data']
    ));
}

if ($node == 'ar') {
    $ar = get_list_by_type($prjid, 102, 'ar', 'ATDP results');
    echo json_encode(array(
        'text' => '.',
        'expanded' => true,
        'data' => $ar['data']
    ));
}

if(!in_array($node,array('root','gd','gl','de','ar'))) {
    echo json_encode(array(
        'text' => '.',
        'expanded' => true,
        'data' => get_by_id($node)));
}

$con->close();

?>
