<?php

require_once __DIR__.'/auth.php';

$attempt=0;

//if($settings->oauthServer != "" && isset($_SESSION['oauthCode'])) {
//
//    $provider = $worker->oauth2_provider();
//    $accessToken = $_SESSION['oauthToken'];
//
//    $request = $provider->getAuthenticatedRequest(
//        'POST',
//        $settings->oauthServer.'/oauth/logout',
//        $accessToken
//    );
//    $response->message = $provider->getResponse($request);
//////    header('Location: ' . $settings->oauthServer . '/oauth/logout');
//} else {
    $response->message = "logout";
//}

if(isset($_SESSION["attempt"])) {
    $attempt=$_SESSION["attempt"];
}

$_SESSION=array();
$_SESSION["attempt"]=$attempt;

$response->success = true;
print_r($response->to_json());
