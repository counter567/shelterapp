<?php
require_once (__DIR__ . '/../vendor/autoload.php');

$sa_animal_resouce_client = null;
function sa_get_animal_resource_client()
{
    global $sa_animal_resouce_client;
    if (!$sa_animal_resouce_client) {
        $options = sa_get_config();
        $config = new OpenAPI\Client\Configuration();
        $config->setHost(isset($options['shelterapp_host']) ? $options['shelterapp_host'] : '');
        $config->setAccessToken(isset($options['shelterapp_token']) ? $options['shelterapp_token'] : '');

        $sa_animal_resouce_client = new OpenAPI\Client\Api\AnimalResourceApi(
            new GuzzleHttp\Client(),
            $config,
        );
    }
    return $sa_animal_resouce_client;
}

$sa_animal_event_client = null;
function sa_get_animal_event_client()
{
    global $sa_animal_event_client;
    if (!$sa_animal_event_client) {
        $options = sa_get_config();
        $config = new OpenAPI\Client\Configuration();
        $config->setHost(isset($options['shelterapp_host']) ? $options['shelterapp_host'] : '');
        $config->setAccessToken(isset($options['shelterapp_token']) ? $options['shelterapp_token'] : '');

        $sa_animal_event_client = new OpenAPI\Client\Api\AnimalEventResourceApi(
            new GuzzleHttp\Client(),
            $config,
        );
    }
    return $sa_animal_event_client;
}

$sa_auth_client = null;
function sa_get_auth_client()
{
    global $sa_auth_client;
    if (!$sa_auth_client) {
        $options = sa_get_config();
        $config = new OpenAPI\Client\Configuration();
        $config->setHost(isset($options['shelterapp_host']) ? $options['shelterapp_host'] : '');
        $config->setAccessToken(isset($options['shelterapp_token']) ? $options['shelterapp_token'] : '');

        $sa_auth_client = new OpenAPI\Client\Api\AuthResourceApi(
            new GuzzleHttp\Client(),
            $config,
        );
    }
    return $sa_auth_client;
}