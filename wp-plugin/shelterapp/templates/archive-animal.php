<?php
/**
 * The site's entry point.
 *
 * Loads the relevant template part,
 * the loop is executed (when needed) by the relevant template part.
 *
 * @package HelloElementor
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

get_header();

?>
<main id="content" class="site-main post-18 page type-page status-publish hentry">
    <div class="page-content">
        <?php include (plugin_dir_path(SHELTERAPP_PATH) . 'blocks/shelter-block-view/render.php') ?>
    </div>
</main>
<?php

get_footer();