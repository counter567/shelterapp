<?php

/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

global $SHELTERAPP_GLOBAL_ANIMAL;
$view = $SHELTERAPP_GLOBAL_ANIMAL->blockView++;

wp_enqueue_style('shelter-app-frontend-style', plugins_url('js/static/css/main.css', SHELTERAPP_PATH), array(), SHELTERAPP_VERSION, 'all');
wp_enqueue_script('shelter-app-frontend', plugins_url('js/static/js/main.js', SHELTERAPP_PATH), array('wp-api-fetch'), SHELTERAPP_VERSION, true);
wp_localize_script(
	'shelter-app-frontend',
	'sa_app_data',
	array(
		'root' => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wp_rest'),
		'attributes' => $attributes,
		'block' => $block,
		'routerBasePath' => '/animal',
		'publicUrlBase' => plugin_dir_url(SHELTERAPP_PATH) . 'public',
		'paypalAdress' => get_option('shelterapp_plugin_options')['shelterapp_paypal'],
	)
);

if (defined('WP_DEBUG') && true == WP_DEBUG) {
	?>

	<div 
		data-type="<?php echo isset($attributes['type']) ? $attributes['type'] : '' ?>"
		<?php echo get_block_wrapper_attributes(); ?>
	>
		<iframe class="iframe-preview" src="http://localhost:3000">
		</iframe>
	</div>

	<?php
} else {
	?>

	<div
		id="root"
		class="shelterblock-root"
		data-type="<?php echo isset($attributes['type']) ? $attributes['type'] : '' ?>"
		data-status="<?php echo isset($attributes['status']) ? $attributes['status'] : '' ?>"
		data-hideFilters="<?php echo is_post_type_archive('shelterapp_animals') || is_singular('shelterapp_animals') ? 'false' : 'true' ?>"
		<?php echo get_block_wrapper_attributes(); ?>
	>
	</div>

	<?php
}
