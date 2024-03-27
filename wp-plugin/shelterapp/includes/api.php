<?php
require_once(__DIR__ . '/../vendor/autoload.php');

$sa_animal_resouce_client = null;
function sa_get_animal_resource_client(){
    global $sa_animal_resouce_client;
    if(!$sa_animal_resouce_client){
        $options = sa_get_config();
        $config = new OpenAPI\Client\Configuration();
        $config->setHost($options['shelterapp_host']);

        $sa_animal_resouce_client = new OpenAPI\Client\Api\AnimalResourceApi(
            new GuzzleHttp\Client(),
            $config,
        );
    }
    return $sa_animal_resouce_client;
}

$sa_animal_event_client = null;
function sa_get_animal_event_client(){
    global $sa_animal_event_client;
    if(!$sa_animal_event_client){
        $options = sa_get_config();
        $config = new OpenAPI\Client\Configuration();
        $config->setHost($options['shelterapp_host']);

        $sa_animal_event_client = new OpenAPI\Client\Api\AnimalEventResourceApi(
            new GuzzleHttp\Client(),
            $config,
        );
    }
    return $sa_animal_event_client;
}