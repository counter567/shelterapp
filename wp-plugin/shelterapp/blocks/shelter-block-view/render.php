<?php

/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

wp_localize_script(
	'create-block-shelter-block-view-view-script',
	'sa_app_data',
	array(
		'root' => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wp_rest'),
		'attributes' => $attributes,
		'block' => $block,
	)
);

if (defined('WP_DEBUG') && true == WP_DEBUG) {
	?>

	<div data-type="<?php echo isset($attributes['type']) ? $attributes['type'] : '' ?>" <?php echo get_block_wrapper_attributes(); ?>>
		<iframe class="iframe-preview" src="http://localhost:3000">
		</iframe>
	</div>

	<?php
} else {
	?>

	<div data-type="<?php echo isset($attributes['type']) ? $attributes['type'] : '' ?>" <?php echo get_block_wrapper_attributes(); ?>>
		<?php esc_html_e('Shelter Block View – hello from a dynamic block!', 'shelter-block-view'); ?>
	</div>

	<?php
}
