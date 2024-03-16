<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function shelter_block_view_shelter_block_view_block_init()
{
    register_block_type(__DIR__ . '/shelter-block-view');
}
add_action('init', 'shelter_block_view_shelter_block_view_block_init');
