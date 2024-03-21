<?php

/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
print_r($attributes);

wp_localize_script('create-block-shelter-block-view-view-script', 'wpApiSettings', array(
	'root' => esc_url_raw(rest_url()),
	'nonce' => wp_create_nonce('wp_rest')
));

?>
<div data-type="<?php echo isset($attributes['type']) ? $attributes['type'] : '' ?>" <?php echo get_block_wrapper_attributes(); ?>>
	<?php esc_html_e('Shelter Block View – hello from a dynamic block!', 'shelter-block-view'); ?>
</div>