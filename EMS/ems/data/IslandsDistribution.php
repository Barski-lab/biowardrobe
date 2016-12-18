<?php

require_once('../auth.php');

//logmsg(__FILE__);
//logmsg(print_r($_REQUEST, true));

if (isset($_REQUEST['uid']))
    $uid = $_REQUEST['uid'];
else
    $response->print_error('Not enough required parameters.');

check_val($uid);

$experiment = selectSQL("select * from labdata where uid=?", array("s", $uid))[0];
$eparams = json_decode($experiment ['params']);

$alias = $experiment['name4browser'];

if ($alias == "")
    $response->print_error('Cant find alias');

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

$where=parse_where_global($eparams->filter);

if ($eparams->uniqislands) {
    $output = selectSQL("select t.region as region,sum(t.count) as count from
    (select distinct region,1 as count,chrom,start,end,length from `{$EDB}`.`{$tablename}` where region is not null {$where}
    group by chrom,start,end,length) as t group by t.region order by t.region;", array());
} else {
    $output = selectSQL("select region,count(region) as count from `{$EDB}`.`{$tablename}` where region is not null {$where} group by region order by region;", array());
}



$DATA = array(
    'name' => $alias,
    'promoter' => $eparams->promoter,
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
        "name" => "promoter",
        "type" => "int"
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

