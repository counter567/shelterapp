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

$id = get_option('sa_page_animal_archive', false);
$additionalContent = '';
if ($id) {
    $page = get_post($id);
    $additionalContent = $page->post_content;
}

get_header();

?>
<main id="content" class="site-main post-18 page type-page status-publish hentry">
    <div class="page-content">
        <?php echo $additionalContent; ?>

        <?php include (plugin_dir_path(SHELTERAPP_PATH) . 'blocks/shelter-block-view/render.php') ?>
    </div>
</main>
<?php

get_footer();