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


function check_rights($place=0) {
    return ($_SESSION["username"] == "admin");
}

function guid(){
    if (function_exists('com_create_guid')){
        return trim(com_create_guid(),'{}');
    }else{
        mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45);// "-"
        $uuid =
                substr($charid, 0, 8).$hyphen
                .substr($charid, 8, 4).$hyphen
                .substr($charid,12, 4).$hyphen
                .substr($charid,16, 4).$hyphen
                .substr($charid,20,12);
        return $uuid;
    }
}

session_start();
require_authentication();
session_write_close();

?>
