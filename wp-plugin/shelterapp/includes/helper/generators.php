<?php

function sa_generate_taxonomy(
    $taxonomy,
    $object_type,
    $single,
    $plural,
    $slug = null
) {
    if ($slug === null) {
        $slug = $taxonomy;
    }
    $labels_tax = array(
        'name'              => _x("$single", 'taxonomy general name', 'selfpublisher'),
        'singular_name'     => _x("$single", 'taxonomy singular name', 'selfpublisher'),
        'search_items'      => __("Suche $single", 'selfpublisher'),
        'all_items'         => __("Alle $plural", 'selfpublisher'),
        'parent_item'       => __("Übergeordnete $single", 'selfpublisher'),
        'parent_item_colon' => __("Übergeordnete $single:", 'selfpublisher'),
        'edit_item'         => __("Edit $single", 'selfpublisher'),
        'update_item'       => __("Update $single", 'selfpublisher'),
        'add_new_item'      => __("Neue $single", 'selfpublisher'),
        'new_item_name'     => __("Neue $single", 'selfpublisher'),
        'menu_name'         => __("$single", 'selfpublisher')
    );

    $args_tax = array(
        'hierarchical'      => true,
        'labels'            => $labels_tax,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => $slug)
    );

    register_taxonomy($taxonomy, $object_type, $args_tax);
}
