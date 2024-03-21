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
include_once(__DIR__ . '/includes/index.php');
include_once(__DIR__ . '/blocks/index.php');



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

header("Access-Control-Allow-Origin: *");
