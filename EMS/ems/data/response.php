<?php
/**
 * @class Response
 * A simple JSON Response class.
 */
class Response {
    public $success, $data, $total,$message, $R;

    public function __construct($params = array()) {
        $this->success  = isset($params["success"]) ? $params["success"] : false;
        $this->message  = isset($params["message"]) ? $params["message"] : '';
        $this->total    = isset($params["total"]) ? $params["total"] : '';
        $this->data     = isset($params["data"])    ? $params["data"]    : array();
    }

    public function to_json() {
        $DATA=array(
            'success'   => $this->success,
            'message'   => $this->message,
            'total'     => $this->total,
            'data'      => $this->data );
        return json_encode($DATA);
    }

    public function print_error($err_msg) {
        $this->success = false;
        $this->message = $err_msg;
        print_r(json_encode(array(
            'success'   => $this->success,
            'message'   => $this->message
        )));
        die();
    }
}

$res = new Response();
