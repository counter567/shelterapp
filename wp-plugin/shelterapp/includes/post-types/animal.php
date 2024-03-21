<?php
defined('ABSPATH') or die("");
global $preventPreGetPosts;
$preventPreGetPosts = false;

class ShelterappAnimals
{
    private $rest_is_init = false;

    function __construct()
    {
        add_action('init', array($this, 'register_post_type'));
        add_action('admin_menu', array($this, 'setup_admin'));
        add_action('rest_api_init', array($this, 'init_rest'));
        $this->register_custom_fields();

        // add_action('after_switch_theme', array($this, 'after_switch_theme'));
        // add_action('switch_theme', array($this, 'switch_theme'));
    }

    function init_rest()
    {
        $this->rest_is_init = true;
        register_rest_field(
            'shelterapp_animals',
            'shelterapp_meta',
            array(
                'get_callback'      => array($this, 'get_meta_rest'),
                'update_callback'   => array($this, 'set_meta_rest'),
                'schema'            => null
            )
        );
    }

    function set_meta_rest($value, $object)
    {
        foreach ($value as $field => $val) {
            if ($field === 'search-data') {
                continue;
            }
            if (is_array($val) && !str_contains($field, '___')) {
                $old = get_post_meta($object->ID, $field, true);
                if (isset($old) && !empty($old) && is_array($old)) {
                    foreach ($old as $old_val) {
                        if (is_int($old_val) || is_string($old_val)) {
                            delete_post_meta($object->ID, $field . '___' . $old_val);
                        }
                    }
                }
                if (!empty($val)) {
                    foreach ($val as $new_val) {
                        if (is_int($new_val) || is_string($new_val)) {
                            update_post_meta($object->ID, $field . '___' . $new_val, $new_val);
                        }
                    }
                }
            }
            update_post_meta($object->ID, $field, $val);
        }
    }

    function get_meta_rest($object)
    {
        $post_id = $object['id'];
        $meta = get_post_meta($post_id, '', true);
        foreach ($meta as $key => $value) {
            if ($key === 'search-data') {
                continue;
            }
            $meta[$key] = get_post_meta($post_id, $key, true);
        }
        return $meta;
    }

    function setup_admin()
    {
    }

    function register_post_type()
    {
        // Set UI labels for Custom Post Type animals
        $labels_type = array(
            'name'                => _x('Tiere', 'Post Type General Name', 'shelterapp'),
            'singular_name'       => _x('Tier', 'Post Type Singular Name', 'shelterapp'),
            'menu_name'           => __('Tiere', 'shelterapp'),
            'parent_item_colon'   => __('Übergeordnetes Tier', 'shelterapp'),
            'all_items'           => __('Alle Tiere', 'shelterapp'),
            'view_item'           => __('Zeige Tier', 'shelterapp'),
            'add_new_item'        => __('Tier hinzufügen', 'shelterapp'),
            'add_new'             => __('Tier hinzufügen', 'shelterapp'),
            'edit_item'           => __('Tier bearbeiten', 'shelterapp'),
            'update_item'         => __('Tier aktualisieren', 'shelterapp'),
            'search_items'        => __('Tier suchen', 'shelterapp'),
            'not_found'           => __('Tier nicht gefunden', 'shelterapp'),
            'not_found_in_trash'  => __('Tier im Papierkorb nicht gefunden', 'shelterapp')
        );

        // Set other options for Custom Post Type animals
        $args_type = array(
            'label'                 => __('Tier', 'shelterapp'),
            'description'           => __('Shelterapp Tierekatalog', 'shelterapp'),
            'labels'                => $labels_type,
            'supports'              => array('title', 'author', 'thumbnail', 'revisions', 'custom-fields'),
            'show_in_rest'          => true,
            'taxonomies'            => array('shelterapp_animal_type'),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'show_in_nav_menus'     => false,
            'show_in_admin_bar'     => false,
            'menu_position'         => 35,
            'can_export'            => true,
            'has_archive'           => false,
            'exclude_from_search'   => true,
            'publicly_queryable'    => true,
            'rewrite'               => array('slug' => 'animal'), // my custom slug
            'menu_icon'             => 'dashicons-buddicons-replies',
            'capability_type'       => 'animal',
            'capabilities'          => sa_compile_post_type_capabilities('animal', 'animals')
        );

        register_post_type('shelterapp_animals', $args_type);

        sa_generate_taxonomy(
            'shelterapp_animal_type',
            array('shelterapp_animals'),
            'Tier Art',
            'Tier Art',
            'type'
        );
    }

    function activate_plugin()
    {
        $roles = array('administrator', 'editor', 'author', 'contributor');
        foreach ($roles as $role) {
            $role = get_role($role);
            $capabilities = sa_compile_post_type_capabilities('animal', 'animals');
            foreach ($capabilities as $capability) {
                $role->add_cap($capability);
            }
        }
        flush_rewrite_rules();
    }

    function deactivate_plugin()
    {
        $roles = array('administrator', 'editor', 'author', 'contributor');
        foreach ($roles as $role) {
            $role = get_role($role);
            $capabilities = sa_compile_post_type_capabilities('animal', 'animals');
            foreach ($capabilities as $capability) {
                $role->remove_cap($capability);
            }
        }
        flush_rewrite_rules();
    }

    function register_custom_fields()
    {

        if (function_exists('acf_add_local_field_group')) {

            /*
            acf_add_local_field_group(array(
                'key' => 'group_0000000000001',
                'title' => 'Animal Basics',
                'fields' => array(
                    array(
                        'key' => 'field_0000000000001',
                        'label' => 'Tier Art',
                        'name' => 'sa_type',
                        'aria-label' => '',
                        'type' => 'textarea',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'new_lines' => '',
                        'maxlength' => '',
                        'placeholder' => '',
                        'rows' => '',
                    ),
                ),
                'location' => array(
                    array(
                        array(
                            'param' => 'post_type',
                            'operator' => '==',
                            'value' => 'shelterapp_animals',
                        )
                    ),
                ),
                'menu_order' => -1,
                'position' => 'side',
                'style' => 'default',
                'label_placement' => 'top',
                'instruction_placement' => 'label',
                'hide_on_screen' => '',
                'active' => true,
                'description' => '',
                'show_in_rest' => 0,
            ));*/
        }
    }
}

global $SHELTERAPP_GLOBAL_ANIMAL;
$SHELTERAPP_GLOBAL_ANIMAL = new ShelterappAnimals();
