<?php

  function require_authentication() {
    if (!isset($_SESSION["timeout"]) || $_SESSION["timeout"]=="") {
      session_destroy();
      header("Location:login.php");
      exit;
    }
    if($_SESSION["timeout"] + 600 < time()){
      session_destroy();
      header("Location:login.php?timeout=true");
      exit;
    }
    $_SESSION["timeout"]=time();
  }

  session_start();
  require_authentication();
?>
