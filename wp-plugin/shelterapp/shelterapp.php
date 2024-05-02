<?php
/*
Plugin Name: Shelterapp
Plugin URI: 
Description: 
Version: 0.0.1
Requires at least: 
Requires PHP: 
Author: 
Author URI: 
License: 
Text Domain: shelterapp
*/
define('SHELTERAPP_PATH', __FILE__);
include_once (__DIR__ . '/includes/index.php');
include_once (__DIR__ . '/blocks/index.php');



/* Main Plugin File */
function sa_activate()
{
    global $SHELTERAPP_GLOBAL_ANIMAL;
    $SHELTERAPP_GLOBAL_ANIMAL->activate_plugin();
}
register_activation_hook(__FILE__, 'sa_activate');

function sa_deactivate()
{
    global $SHELTERAPP_GLOBAL_ANIMAL;
    $SHELTERAPP_GLOBAL_ANIMAL->deactivate_plugin();
}
register_deactivation_hook(__FILE__, 'sa_deactivate');

function add_cors_http_header()
{
    if (defined('WP_DEBUG') && true == WP_DEBUG) {
        /**
         * Tell robots not to index or follow
         * Set header replace parameter to true
         */
        error_log('======================================');
        header("Access-Control-Allow-Origin: *");
        header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS, post, get');
        header('Access-Control-Max-Age: 3600');
        header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
    }
}
add_action("send_headers", "add_cors_http_header", 99);

function out(...$print)
{
    echo '<pre style="font-family: monospace; font-size: 10px;">';
    foreach ($print as $key => $value) {
        print_r($value);
    }
    echo '</pre>';
}

function outLog(...$print)
{

    foreach ($print as $key => $value) {
        error_log($value);
    }

}