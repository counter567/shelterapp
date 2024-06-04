<?php
require_once (__DIR__ . '/../vendor/autoload.php');

$validated = null;
function sa_refresh_token_if_needed()
{
    global $validated;
    $isTokenValid = sa_validate_access_token();
    if ($isTokenValid) {
        return true;
    }
    if ($validated === null && !$isTokenValid) {
        outLog('Token invalid.');
        $options = sa_get_config();
        $config = new OpenAPI\Client\Configuration();
        $config->setHost(isset($options['shelterapp_host']) ? $options['shelterapp_host'] : '');
        $config->setAccessToken(isset($options['shelterapp_refresh']) ? $options['shelterapp_refresh'] : '');

        $auth_client = new OpenAPI\Client\Api\AuthResourceApi(
            new GuzzleHttp\Client(),
            $config,
        );
        try {
            $response = $auth_client->authRefreshGet();
            $options['shelterapp_token'] = $response->getAccessToken();
            update_option('shelterapp_plugin_options', $options);
            $validated = true;
            outLog('Got new token.');
        } catch (Exception $e) {
            $validated = false;
            outLog('Unable to fetch new token: ' . $e->getMessage());
        }
    }
    return $validated;
}

function sa_validate_access_token()
{
    $options = sa_get_config();
    $config = new OpenAPI\Client\Configuration();
    $config->setHost(isset($options['shelterapp_host']) ? $options['shelterapp_host'] : '');
    $config->setAccessToken(isset($options['shelterapp_token']) ? $options['shelterapp_token'] : '');

    $auth_client = new OpenAPI\Client\Api\AuthResourceApi(
        new GuzzleHttp\Client(),
        $config,
    );

    try {
        $auth_client->authTokenValidateGet();
        return true;
    } catch (Exception $e) {
        return false;
    }
}

$sa_animal_resouce_client = null;
function sa_get_animal_resource_client()
{
    global $sa_animal_resouce_client;
    if (!$sa_animal_resouce_client && sa_refresh_token_if_needed()) {
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
    if (!$sa_animal_event_client && sa_refresh_token_if_needed()) {
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

        $sa_auth_client = new OpenAPI\Client\Api\AuthResourceApi(
            new GuzzleHttp\Client(),
            $config,
        );
    }
    return $sa_auth_client;
}