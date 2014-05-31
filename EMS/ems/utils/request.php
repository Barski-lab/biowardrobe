<?php
class Request {
    public $method, $params;

    public function __construct($params) {
        $this->method = $_SERVER["REQUEST_METHOD"];
        $this->parseRequest();
    }

    protected function parseRequest() {

            if (isset($_REQUEST['data'])) {
                $this->params =  json_decode(stripslashes($_REQUEST['data']));
            } else {
                $raw  = '';
                $httpContent = fopen('php://input', 'r');
                //print_r($httpContent);
                while ($kb = fread($httpContent, 1024)) {
                    $raw .= $kb;
                }
                $params = json_decode(stripslashes($raw));
                if ($params) {
                    $this->params = $params->data;
                }
            }
    }
}
?>
