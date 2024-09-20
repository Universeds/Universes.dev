<?php
require_once 'vendor/autoload.php';
use GeoIp2\Database\Reader;

$reader = new Reader('../maxmind-db/GeoLite2-City.mmdb');
$user_ip = $_SERVER['REMOTE_ADDR'];

try {
    if ($reader->city($user_ip)->country->isoCode === 'FR') {
        header('HTTP/1.0 403 Forbidden');
        exit('Access denied.');
    }
} catch (Exception $e) {}

?>