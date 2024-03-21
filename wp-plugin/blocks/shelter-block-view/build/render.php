<div style="white-space: pre; border: 1px solid #000; font-family: monospace; font-size: 10px;">
	<?php

	/**
	 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
	 */

	wp_localize_script('create-block-shelter-block-view-view-script', 'sa_app_data', array(
		'root' => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wp_rest'),
		'attributes' => $attributes,
		'block' => $block,
	));

	?>
</div>

<div data-type="<?php echo isset($attributes['type']) ? $attributes['type'] : '' ?>" <?php echo get_block_wrapper_attributes(); ?>>
	<?php esc_html_e('Shelter Block View – hello from a dynamic block!', 'shelter-block-view'); ?>
</div>