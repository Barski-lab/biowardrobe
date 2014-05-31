<?php

require_once('../settings.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST, true));

if (isset($_REQUEST['uid']))
    $uid = $_REQUEST['uid'];
else
    $response->print_error('Not enough required parameters.');

check_val($uid);

$query_array = selectSQL("SELECT name4browser from labdata where uid=?", array("s", $uid));
$filename = $query_array[0]['name4browser'];

if ($filename == "")
    $response->print_error('Cant find file name');

$EDB = $settings->settings['experimentsdb']['value'];

$tablename = "{$uid}_islands";

for ($i = 0; $i < 100; $i++) {
    $describe = selectSQL("describe `{$EDB}`.`{$tablename}`", array());

    if ($describe[0]['Field'] == "refseq_id") {
        break;
    } else {
        if ($i == 99)
            $response->print_error('Not ready yet');
        sleep(2);
    }
}

$output = selectSQL("select region,count(region) as count from `{$EDB}`.`{$tablename}` where region is not null group by region order by region;", array());

$DATA = array(
    'name' => $filename,
    'Upstream' => $output[4]['count'],
    'Promoter' => $output[3]['count'],
    'Exon' => $output[0]['count'],
    'Intron' => $output[2]['count'],
    'Intergenic' => $output[1]['count'],
    'Total' => $output[0]['count'] + $output[1]['count'] + $output[2]['count'] + $output[3]['count'] + $output[4]['count']
);

$fields = array(
    array(
        "name" => "name",
        "type" => "string"
    ),
    array(
        "name" => "Upstream",
        "type" => "int"
    ),
    array(
        "name" => "Promoter",
        "type" => "int"
    ),
    array(
        "name" => "Exon",
        "type" => "int"
    ),
    array(
        "name" => "Intron",
        "type" => "int"
    ),
    array(
        "name" => "Intergenic",
        "type" => "int"
    ),
    array(
        "name" => "Total",
        "type" => "int"
    )
);


$response->success = true;
$response->message = "Data loaded";
$response->total = sizeof($DATA);
$response->meta = array("fields" => $fields);
$response->data = $DATA;
print_r($response->to_json());
?>

