<?php

  include('/etc/settings/config.php');

function logmsg($log_string){
    error_log("\n".$log_string,3,'/tmp/php.log');
}


  function require_authentication() {
    global $rootdir;
    if (!isset($_SESSION["timeout"]) || $_SESSION["timeout"]=="") {
      session_destroy();
      header("Location:".$rootdir."/login.php");
      exit;
    }
    if($_SESSION["timeout"] + 600 < time()){
      session_destroy();
      header("Location:".$rootdir."/login.php?timeout=true");
      exit;
    }
    $_SESSION["timeout"]=time();
  }

  session_start();
  require_authentication();
?>
