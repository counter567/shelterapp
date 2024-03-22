<?php

function dbi_register_settings()
{
    register_setting('shelterapp_plugin_options', 'shelterapp_plugin_options', 'shelterapp_plugin_options_validate');
    add_settings_section('shelterapp_settings', 'Shelter App Settings', 'shelterapp_plugin_setting_shelterapp_text', 'shelterapp_plugin');

    add_settings_field('shelterapp_plugin_setting_shelterapp_host', 'Shelter App Host', 'shelterapp_plugin_setting_shelterapp_host', 'shelterapp_plugin', 'shelterapp_settings');
    add_settings_field('shelterapp_plugin_setting_shelterapp_token', 'Shelter App Token', 'shelterapp_plugin_setting_shelterapp_token', 'shelterapp_plugin', 'shelterapp_settings');
}
add_action('admin_init', 'dbi_register_settings');

function shelterapp_add_settings_page()
{
    add_options_page('Shelter App Settings', 'Shelter App Settings', 'manage_options', 'shelterapp_plugin', 'shelterapp_render_plugin_settings_page');
}
add_action('admin_menu', 'shelterapp_add_settings_page');


function sa_get_config(){
    return get_option('shelterapp_plugin_options', shelterapp_plugin_setting_get_default_congig());
}

// Layout

function shelterapp_render_plugin_settings_page()
{
?>
    <form action="options.php" method="post" autocomplete='off' style="margin: 0 auto; max-width: 800px">
        <?php
        settings_fields('shelterapp_plugin_options');
        do_settings_sections('shelterapp_plugin'); ?>
        <input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e('Save'); ?>" />
    </form>
<?php
}


function shelterapp_plugin_setting_shelterapp_text()
{
    echo '<p>Please add your Shelter App configuration.</p>';
}

// Config

function shelterapp_plugin_setting_get_default_congig()
{
    return array(
        'shelterapp_host' => 'http://backend:8080',
        'shelterapp_token' => '',
    );
}

function shelterapp_plugin_setting_shelterapp_host()
{
    $options = sa_get_config();
    echo "<input autocomplete='off' id='shelterapp_plugin_setting_shelterapp_host' name='shelterapp_plugin_options[shelterapp_host]' type='text' value='" . esc_attr($options['shelterapp_host']) . "' placeholder='Host' />";
}
function shelterapp_plugin_setting_shelterapp_token()
{
    $options = sa_get_config();
    echo "<input autocomplete='off' id='shelterapp_plugin_setting_shelterapp_token' name='shelterapp_plugin_options[shelterapp_token]' type='text' value='" . esc_attr($options['shelterapp_token']) . "' placeholder='Token' />";
}

function shelterapp_plugin_options_validate($input)
{
    $newConfig = array_replace([], $input);

    return $newConfig;
}
