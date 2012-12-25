<?php

  function getDataForUser($username) {
  //json query
    $config_file  = file_get_contents("http://localhost/cgi-bin/barski/params.json?tablename=Worker&params=where%20Worker%20like%20'".$username."'");
    $config_array = json_decode($config_file, true);
    return $config_array["data"][0];
  }

  function validate($response, $data) {
    return $data["Worker"]==$response;
  }

  function authenticate() {
    if (isset($_REQUEST["username"]) && isset($_REQUEST["password"])){

      $data = getDataForUser($_REQUEST["username"]);

      if (validate($_REQUEST["password"], $data)){

        $_SESSION["username"] = $data["Worker"];
        $_SESSION["usergroup"] = $data["Worker"];
        $_SESSION["fullname"] = $data["lname"].", ".$data["fname"];
        $_SESSION["user_id"] = $data["id"];
        $_SESSION["timeout"] = time();

      } else {
        echo '{"success":false,"message":"Incorrect user name or password '.$data["Worker"].'"}';
        exit;
      }
    } else {
      echo '{"success":false,"message":"Incorrect parameters"}';
      exit;
    }
  }

  session_start();
  authenticate();
  echo '{"success":true}';
  exit();
?>
