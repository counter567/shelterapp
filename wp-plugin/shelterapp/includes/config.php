<?php

function dbi_register_settings()
{
    register_setting('shelterapp_plugin_options', 'shelterapp_plugin_options', 'shelterapp_plugin_options_validate');
    add_settings_section('shelterapp_settings', 'Shelter App Settings', 'shelterapp_plugin_setting_shelterapp_text', 'shelterapp_plugin');

    add_settings_field('shelterapp_plugin_setting_shelterapp_host', 'Shelter App Host', 'shelterapp_plugin_setting_shelterapp_host', 'shelterapp_plugin', 'shelterapp_settings');
    add_settings_section('shelterapp_settings_user', '', 'shelterapp_plugin_setting_shelterapp_user_data', 'shelterapp_plugin');
}
add_action('admin_init', 'dbi_register_settings');

function shelterapp_add_settings_page()
{
    add_options_page('Shelter App Settings', 'Shelter App Settings', 'manage_options', 'shelterapp_plugin', 'shelterapp_render_plugin_settings_page');
}
add_action('admin_menu', 'shelterapp_add_settings_page');


function sa_get_config()
{
    return get_option('shelterapp_plugin_options', shelterapp_plugin_setting_get_default_config());
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
function shelterapp_plugin_setting_shelterapp_user_data()
{
    $config = sa_get_config();

    if (isset($config["shelterapp_message"])) {
        echo '<p>' . $config["shelterapp_message"] . '</p>';

        unset($config["shelterapp_message"]);
        update_option('shelterapp_plugin_options', $config);
    }

    if (isset($config["shelterapp_token"])) {
        ?>
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th colspan="2" scope="row">Die Shelterapp ist aktiviert.</th>

                </tr>
                <tr>
                    <th scope="row">Access Token</th>
                    <td>
                        <?php echo substr($config["shelterapp_token"], 0, 10); ?>********<?php echo substr($config["shelterapp_token"], -10, 10); ?>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Refresh Token</th>
                    <td>

                        <?php echo substr($config["shelterapp_refresh"], 0, 10); ?>********<?php echo substr($config["shelterapp_refresh"], -10, 10); ?>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <input class="button button-link-delete" name="shelterapp_plugin_options[shelterapp_reset]"
                            type="submit" value="Löschen" onclick="deleteConfig()">
                    </td>
                </tr>
            </tbody>
        </table>
        <script>
            function deleteConfig() {

            }
        </script>
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
                    <th scope="row">Shelter App E-Mail</th>
                    <td>
                        <input autocomplete="off" id="shelterapp_plugin_setting_shelterapp_host"
                            name="shelterapp_plugin_options[shelterapp_mail]" type="text" placeholder="E-Mail" />
                    </td>
                </tr>
                <tr>
                    <th scope="row">Shelter App Passwort</th>
                    <td>
                        <input autocomplete="off" id="shelterapp_plugin_setting_shelterapp_host"
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
        'shelterapp_host' => 'http://backend:8080',
        'shelterapp_token' => '',
    );
}

function shelterapp_plugin_setting_shelterapp_host()
{
    $options = sa_get_config();
    echo "<input autocomplete='off' id='shelterapp_plugin_setting_shelterapp_host' name='shelterapp_plugin_options[shelterapp_host]' type='text' value='" . esc_attr($options['shelterapp_host']) . "' placeholder='Host' />";
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
            $data['email'] = $newConfig["shelterapp_mail"];
        if (isset($newConfig["shelterapp_user"]) && $newConfig["shelterapp_user"])
            $data['username'] = $newConfig["shelterapp_user"];


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
