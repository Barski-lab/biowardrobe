<?php

include('/etc/settings/config.php');

require_once('response.php');

$con = new mysqli($db_host,$db_name,$db_pass);

if ($con->connect_errno) {
    $res->print_error('Could not connect: ' . $con->connect_error);
}
?>
