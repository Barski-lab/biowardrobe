<?php
require("../common.php");


require_once('response.php');

$con = new mysqli($db_host,$db_name,$db_pass);
$res = new Response();

if ($con->connect_errno) {
    $res->print_error('Could not connect: ' . $con->connect_error);
}
?>
