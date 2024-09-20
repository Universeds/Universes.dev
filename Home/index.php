<?php
require_once '../vendor/autoload.php';
use GeoIp2\Database\Reader;

$reader = new Reader('../maxmind-db/GeoLite2-City.mmdb');
$user_ip = $_SERVER['REMOTE_ADDR'];

try {
    $record = $reader->city($user_ip);
    if ($record->country->isoCode === 'FR') {
        header('Location: forbidden.html');
        exit;
    } else {
        $country = $record->country->name;
    }
} catch (Exception $e) {
    $country = 'Unknown';
}
