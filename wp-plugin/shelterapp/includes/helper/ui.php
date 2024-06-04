<?php

function sa_add_custom_box_animal_galery()
{
    $screens = ['shelterapp_animals'];
    foreach ($screens as $screen) {
        add_meta_box(
            'postimagegalery',
            'Galerie',
            'sa_custom_box_animal_galery_html',
            null,
            'side',
            'low',
            array('__back_compat_meta_box' => true)
        );
    }
}

function sa_custom_box_animal_galery_html($post)
{
    wp_enqueue_script(
        'image-galery-script',
        plugin_dir_url(SHELTERAPP_PATH) . 'js/imageGalery.js',
        array('jquery'),
        '1.0',
        true
    );
    wp_enqueue_style('image-galery-style', plugin_dir_url(SHELTERAPP_PATH) . 'css/imageGalery.css', array(), '1.0');

    $galery_ids = get_post_meta($post->ID, 'otherPictureFileUrls', true);

    $content = '<input type="button" id="add_image_to_galery" class="button button-primary button-large"
    value="Bild Hinzufügen">';
    $content .= '<div id="image-gallery" class="image-gallery">';
    if (isset($galery_ids) && is_array($galery_ids)) {
        foreach ($galery_ids as $id) {
            $content .= '<div class="image-gallery-item" data-id="' . $id . '">';
            $content .= '<img src="' . wp_get_attachment_url($id) . '" alt="Bild">';
            $content .= '<input type="button" class="button button-primary button-large delete" value="Löschen">';
            $content .= '<input type="hidden" name="otherPictureFileUrls[]" value="' . $id . '">';
            $content .= '</div>';
        }
    }
    $content .= '</div>';

    echo $content;
}