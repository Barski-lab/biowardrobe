<?php

include('/etc/settings/config.php');

function logmsg($log_string){
    error_log("\n".$log_string,3,'/tmp/php.log');
}


function require_authentication() {
    global $rootdir;
    if (!isset($_SESSION["timeout"]) || $_SESSION["timeout"]=="") {
        header("Location:".$rootdir."/login.php");
        exit();
    }
    if($_SESSION["timeout"] + 4000 < time()){
        header("Location:".$rootdir."/login.php?timeout=true");
        exit();
    }
    $_SESSION["timeout"]=time();
}

function crypt_pass($U,$P) {
    $salt = hash('sha256', uniqid(mt_rand(), true) . strtolower($U));

    $hash = $salt . $P;
    for ( $i = 0; $i < 100000; $i ++ ) {
      $hash = hash('sha256', $hash);
    }
    $hash = $salt . $hash;
    return $hash;
}


function check_rights($place) {
    return ($_SESSION["username"] == "admin");
}

session_start();
require_authentication();
?>
