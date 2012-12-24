<?php  
  function getPasswordForUser($username) {
//    $config_file = file_get_contents("config.json");
//    $config_array = json_decode($config_file, true);
    return $username;//$config_array["config"][0]["password"];
  }

  function validate($response, $password) {
    return $password==$response;
  }

  function authenticate() {
    if (isset($_REQUEST[username]) && isset($_REQUEST[response])) 
    {
      $password = getPasswordForUser($_REQUEST[username]);

      if (validate($_REQUEST[response], $password)) 
      {
        $_SESSION[authenticated] = "yes";
        $_SESSION[username] = $_REQUEST[username];;
      } else {
        echo '{"success":false,"message":"Incorrect user name or password"}';
        exit;
      }
    } else {
      echo '{"success":false,"message":"Session expired"}';
      exit;
    }
  }

  session_start();
  authenticate();
  echo '{"success":true}';
  exit();
?>