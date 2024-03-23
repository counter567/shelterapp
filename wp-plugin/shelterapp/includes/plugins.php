<?php
function sa_admin_notice_plugins()
{
    $plugin_key = 'advanced-custom-fields/acf.php';
    $plugin_slug = 'advanced-custom-fields';
    $plugin_label = 'Advanced Custom Fields (ACF)';

    if (!is_plugin_active($plugin_key)) {
?>
        <div class="notice notice-warning is-dismissible">
            <h3>Shelter App Problem:</h3>
            <?php
            $all_plugins = get_plugins();
            if (isset($all_plugins[$plugin_key])) {
                // we need to activate the plugin!
                $nonce = wp_create_nonce('activate-plugin_' . $plugin_key);
            ?>
                <p><?php _e('In order to work properly you need to activate the "' . $plugin_label . '" plugin.', 'shelterapp'); ?>
                    <a class="install-now button" data-slug="<?php echo $plugin_slug; ?>" href="/wp-admin/plugins.php?_wpnonce=<?php echo $nonce; ?>&action=activate&plugin=<?php echo $plugin_key; ?>" aria-label="<?php echo $plugin_label; ?> jetzt aktivieren" data-name="<?php echo $plugin_label; ?>">Jetzt aktivieren</a>

                </p>
            <?php
            } else {
                // we need to install the plugin
                $nonce = wp_create_nonce('install-plugin_' . $plugin_slug);
            ?>
                <p><?php _e('In order to work properly you need to install the "' . $plugin_label . '" plugin.', 'shelterapp'); ?>
                    <a class="install-now button" data-slug="<?php echo $plugin_slug; ?>" href="http://localhost:8080/wp-admin/update.php?action=install-plugin&amp;plugin=<?php echo $plugin_slug; ?>&amp;_wpnonce=<?php echo $nonce; ?>" aria-label="<?php echo $plugin_label; ?> jetzt installieren" data-name="<?php echo $plugin_label; ?>">Jetzt installieren</a>
                </p>
            <?php
            }

            ?>
        </div>

<?php
    }
}
add_action('admin_notices', 'sa_admin_notice_plugins');
