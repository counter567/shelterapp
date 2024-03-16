<?php
require_once(__DIR__ . '/vendor/autoload.php');

$config = new OpenAPI\Client\Configuration();
// $config->setHost('http://test');

$apiInstance = new OpenAPI\Client\Api\AnimalEventResourceApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config,
);

try {
    $result = $apiInstance->animalEventsCountGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling AnimalEventResourceApi->animalEventsCountGet: ', $e->getMessage(), PHP_EOL;
}
