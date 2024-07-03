<?php

function shelterapp_register_base_settings()
{
    register_setting('shelterapp_plugin_options', 'shelterapp_plugin_options', 'shelterapp_plugin_options_validate');
    add_settings_section('shelterapp_settings', 'Shelter App Settings', 'shelterapp_plugin_setting_shelterapp_text', 'shelterapp_plugin');

    add_settings_field('shelterapp_plugin_setting_shelterapp_host', 'Shelter App Host', 'shelterapp_plugin_setting_shelterapp_host', 'shelterapp_plugin', 'shelterapp_settings');
    add_settings_section('shelterapp_settings_user', '', 'shelterapp_plugin_setting_shelterapp_user_data', 'shelterapp_plugin');

    add_settings_field('shelterapp_plugin_setting_shelterapp_paypal_link', 'Paypal Adresse', 'shelterapp_plugin_setting_shelterapp_paypal_link', 'shelterapp_plugin', 'shelterapp_settings');

    // add_settings_field('shelterapp_plugin_setting_shelterapp_persync', 'Sync per update', 'shelterapp_plugin_setting_shelterapp_persync', 'shelterapp_plugin', 'shelterapp_settings');
}
add_action('admin_init', 'shelterapp_register_base_settings');

function shelterapp_add_settings_page()
{
    add_options_page('Shelter App Settings', 'Shelter App Settings', 'manage_options', 'shelterapp_plugin', 'shelterapp_render_plugin_settings_page');
}
add_action('admin_menu', 'shelterapp_add_settings_page');




function sa_get_config()
{
    return get_option('shelterapp_plugin_options', shelterapp_plugin_setting_get_default_config());
}
function sa_set_config($config)
{
    // merge existing config with new config
    $newConfig = array_replace(sa_get_config(), $config);
    update_option('shelterapp_plugin_options', $newConfig);
}

// Layout

function shelterapp_render_plugin_settings_page()
{
    ?>
    <div class="wrap">
        <form action="options.php" method="post" autocomplete='off'>
            <?php
            settings_fields('shelterapp_plugin_options');
            do_settings_sections('shelterapp_plugin'); ?>
            <input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e('Save'); ?>" />
            <style>
                .wrap input[type="text"] {
                    min-width:50vw;
                }
            </style>
        </form>
    </div>
    <?php
}


function shelterapp_plugin_setting_shelterapp_text()
{
    echo '<p>Please add your Shelter App configuration.</p>';
}
function shelterapp_plugin_setting_shelterapp_user_data()
{
    $config = sa_get_config();

    if (isset($config["shelterapp_message"])) {
        echo '<p>' . $config["shelterapp_message"] . '</p>';

        unset($config["shelterapp_message"]);
        update_option('shelterapp_plugin_options', $config);
    }

    if (isset($config["shelterapp_token"]) && isset($config["shelterapp_refresh"])) {
        ?>
        <div style="margin:2rem 0; background: #c6f29ad6; padding: 1rem 0.5rem">
        <table class="form-table" role="presentation" >
            <tbody>
                <tr>
                    <th colspan="2" scope="row" style="padding: 0.25rem;"><h1 style="padding:0 0 1rem 0">Die Shelterapp ist aktiviert.</h1></th>
                </tr>
                <tr>
                    <th scope="row" style="padding: 0.25rem;">Access Token</th>
                    <td style="padding: 0.25rem;">
                        <?php echo substr($config["shelterapp_token"], 0, 10); ?>********<?php echo substr($config["shelterapp_token"], -10, 10); ?>
                    </td>
                </tr>
                <tr>
                    <th scope="row" style="padding: 0.25rem;">Refresh Token</th>
                    <td style="padding: 0.25rem;">
                        <?php echo substr($config["shelterapp_refresh"], 0, 10); ?>********<?php echo substr($config["shelterapp_refresh"], -10, 10); ?>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <td colspan="2">
                        <input class="button button-link-delete" name="shelterapp_plugin_options[shelterapp_reset]"
                            type="submit" value="Löschen" onclick="deleteConfig()">
                    </td>
                </tr>
            </tbody>
        </table>
        <?php
    } else {

        ?>
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row">Shelter App User</th>
                    <td>
                        <input autocomplete="off" id="shelterapp_plugin_setting_shelterapp_host"
                            name="shelterapp_plugin_options[shelterapp_user]" type="text" placeholder="User" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">Shelter App Passwort</th>
                    <td>
                        <input autocomplete="off" id="shelterapp_plugin_setting_shelterapp_host" class="regular-text"
                            name="shelterapp_plugin_options[shelterapp_password]" type="text" placeholder="Passwort" />
                    </td>
                </tr>
            </tbody>
        </table>
        <?php
    }
}

// Config

function shelterapp_plugin_setting_get_default_config()
{
    return array(
        'shelterapp_host' => 'https://backend.shelterapp.spedat.de',
        'shelterapp_token' => '',
        'shelterapp_paypal' => '',
        'shelterapp_persync' => 10,
    );
}

function shelterapp_plugin_setting_shelterapp_host()
{
    $options = sa_get_config();
    echo "<input autocomplete='off' id='shelterapp_plugin_setting_shelterapp_host' name='shelterapp_plugin_options[shelterapp_host]' type='text' value='" . esc_attr($options['shelterapp_host']) . "' placeholder='Host' />";
}

function shelterapp_plugin_setting_shelterapp_paypal_link()
{
    $options = sa_get_config();
    echo "<input autocomplete='off' id='shelterapp_plugin_setting_shelterapp_paypal_link' name='shelterapp_plugin_options[shelterapp_paypal]' type='text' value='" . esc_attr($options['shelterapp_paypal']) . "' placeholder='Paypal Adresse' />" . 
    "<p>Geben sie hier die Adresse zu ihrer Paypal spenden Seite an.</p>".
    "<p>Beispiel: mein-tierheim@mail.de</p>";
}

function shelterapp_plugin_setting_shelterapp_persync()
{
    $options = sa_get_config();
    echo "<input autocomplete='off' id='shelterapp_plugin_setting_shelterapp_persync' name='shelterapp_plugin_options[shelterapp_persync]' type='number' value='" .
    esc_attr($options['shelterapp_persync'] ? $options['shelterapp_persync'] : 10) .
    "' placeholder='Sync per update' />" . 
    "<p>Wie viele Tiere sollen pro Update synchronisiert werden?</p>" . 
    "<p>Wenn sie während des Updateprozesses Timeouts erleben, reduzieren sie diese Nummer.</p>" . 
    "<p>Empfohlen: 10</p>";
}



function shelterapp_plugin_options_validate($input)
{
    $options = sa_get_config();
    $newConfig = array_replace([], $input);

    if (
        isset($newConfig["shelterapp_password"]) && (
            isset($newConfig["shelterapp_mail"]) || isset($newConfig["shelterapp_user"])
        )
    ) {
        $data = [
            'password' => $newConfig["shelterapp_password"],
        ];
        if (isset($newConfig["shelterapp_mail"]) && $newConfig["shelterapp_mail"])
            $data['username'] = $newConfig["shelterapp_mail"];
        if (isset($newConfig["shelterapp_user"]) && $newConfig["shelterapp_user"])
            $data['username'] = $newConfig["shelterapp_user"];

        $data['permanent'] = true;

        // try to login and retrieve token
        $authClient = sa_get_auth_client();
        try {
            $request = new \OpenAPI\Client\Model\LoginRequest($data);
            $response = $authClient->authLoginPost($request);

            $newConfig["shelterapp_token"] = $response->getAccessToken();
            $newConfig["shelterapp_refresh"] = $response->getRefreshToken();
        } catch (Exception $e) {
            $newConfig["shelterapp_message"] = 'Login failed. Please check your credentials.' . $e->getMessage();
        }
    } else if (!isset($newConfig["shelterapp_reset"])) {
        $newConfig["shelterapp_token"] = $options["shelterapp_token"];
        $newConfig["shelterapp_refresh"] = $options["shelterapp_refresh"];
    }

    unset($newConfig["shelterapp_password"]);
    unset($newConfig["shelterapp_mail"]);
    unset($newConfig["shelterapp_user"]);
    unset($newConfig["shelterapp_reset"]);

    return $newConfig;
}
