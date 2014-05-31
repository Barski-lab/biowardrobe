<?php
require_once('utils/response.php');

session_start();
$attempt=0;
if(isset($_SESSION["attempt"])) {
    $attempt=$_SESSION["attempt"];
}
$_SESSION=array();
$_SESSION["attempt"]=$attempt;

$response = new Response();
$response->success = true;
$response->message = "logout";
print_r($response->to_json());
?>
