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

        add_action('after_switch_theme', array($this, 'after_switch_theme'));
        add_action('switch_theme', array($this, 'switch_theme'));
    }

    function init_rest()
    {
        $this->rest_is_init = true;
        register_rest_field(
            'shelterapp_animals',
            'shelterapp_meta',
            array(
                'get_callback' => array($this, 'get_meta_rest'),
                'update_callback' => array($this, 'set_meta_rest'),
                'schema' => null
            )
        );
        register_rest_route(
            'sa/v1',
            '/restData',
            array(
                'methods' => 'GET',
                'callback' => function ($data) {
                    return array (
                        'root' => esc_url_raw(rest_url()),
                        'nonce' => wp_create_nonce('wp_rest')
                    );
                },
                'permission_callback' => function () {
                    return true;
                }
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

        $type = wp_get_post_terms($post_id, 'shelterapp_animal_type');
        if (isset($type) && count($type) > 0) {
            $meta['type'] = $type[0]->name;
        }

        $illnesses = wp_get_post_terms($post_id, 'shelterapp_animal_illness');
        $meta['illnesses'] = [];
        foreach ($illnesses as $illness) {
            $meta['illnesses'][] = $illness->name;
        }

        $allergies = wp_get_post_terms($post_id, 'shelterapp_animal_allergies');
        $meta['allergies'] = [];
        foreach ($allergies as $allergy) {
            $meta['allergies'][] = $allergy->name;
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
            'name' => _x('Tiere', 'Post Type General Name', 'shelterapp'),
            'singular_name' => _x('Tier', 'Post Type Singular Name', 'shelterapp'),
            'menu_name' => __('Tiere', 'shelterapp'),
            'parent_item_colon' => __('Übergeordnetes Tier', 'shelterapp'),
            'all_items' => __('Alle Tiere', 'shelterapp'),
            'view_item' => __('Zeige Tier', 'shelterapp'),
            'add_new_item' => __('Tier hinzufügen', 'shelterapp'),
            'add_new' => __('Tier hinzufügen', 'shelterapp'),
            'edit_item' => __('Tier bearbeiten', 'shelterapp'),
            'update_item' => __('Tier aktualisieren', 'shelterapp'),
            'search_items' => __('Tier suchen', 'shelterapp'),
            'not_found' => __('Tier nicht gefunden', 'shelterapp'),
            'not_found_in_trash' => __('Tier im Papierkorb nicht gefunden', 'shelterapp')
        );

        // Set other options for Custom Post Type animals
        $args_type = array(
            'label' => __('Tier', 'shelterapp'),
            'description' => __('Shelterapp Tierekatalog', 'shelterapp'),
            'labels' => $labels_type,
            'supports' => array('title', 'author', 'thumbnail', 'revisions', 'custom-fields'),
            'show_in_rest' => true,
            'taxonomies' => array('shelterapp_animal_type'),
            'hierarchical' => false,
            'public' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_nav_menus' => false,
            'show_in_admin_bar' => false,
            'menu_position' => 35,
            'can_export' => true,
            'has_archive' => false,
            'exclude_from_search' => true,
            'publicly_queryable' => true,
            'rewrite' => array('slug' => 'animal'), // my custom slug
            'menu_icon' => 'dashicons-buddicons-replies',
            'capability_type' => 'animal',
            'capabilities' => sa_compile_post_type_capabilities('animal', 'animals')
        );

        register_post_type('shelterapp_animals', $args_type);

        sa_generate_taxonomy(
            'shelterapp_animal_type',
            array('shelterapp_animals'),
            'Tier Art',
            'Tier Art',
            'type'
        );
        sa_generate_taxonomy(
            'shelterapp_animal_illness',
            array('shelterapp_animals'),
            'Tier Krankheit',
            'Tier Krankheiten',
            null,
            false
        );
        sa_generate_taxonomy(
            'shelterapp_animal_allergies',
            array('shelterapp_animals'),
            'Tier Allergie',
            'Tier Allergien',
            null,
            false
        );


        $this->register_custom_fields();

        // $this->sync();
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
        if (!function_exists('acf_add_local_field_group')) {
            return;
        }

        $group = array(
            'key' => 'group_65fc4ecf8ebee',
            'title' => 'Animal fields',
            'fields' => array(),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'shelterapp_animals',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'hide_on_screen' => '',
            'active' => true,
            'description' => '',
            'show_in_rest' => 0,
        );

        $file = file_get_contents(dirname(__FILE__) . '/../../openapi.json');
        $schema = json_decode($file, true);
        $animalSchema = $schema['components']['schemas']['Animal']['properties'];
        $required = $schema['components']['schemas']['Animal']['required'];

        $this->get_custom_input_group('Stammdaten', [
            'dateOfBirth',
            'sex',
            'color',
            'breedOne',
            'breedTwo',
            'chipNumber',
            'description',
            'wasFound',
            'missing',
        ], $animalSchema, $schema, $required);

        $this->get_custom_input_group('Maße', [
            'weight',
            'heightAtWithers',
            'circumferenceOfNeck',
            'lengthOfBack',
            'circumferenceOfChest',
        ], $animalSchema, $schema, $required);

        $this->get_custom_input_group('Shelter Interner', [
            'dateOfAdmission',
            'dateOfLeave',
            'dateOfDeath',
            'status',
            'notes',
            'internalNotes',
            'donationCall',
            'successStory',
            'privateAdoption',
        ], $animalSchema, $schema, $required);

        $this->get_custom_input_group('Medizinisches', [
            'castrated',
            'bloodType',
            'illnesses',
            'allergies',
        ], $animalSchema, $schema, $required);

        /*
        mainPictureFileUrl
        otherPictureFileUrls
        */
    }

    function get_custom_input_group(string $groupName, array $fields, $animalSchema, $schema, $required)
    {
        $group = array(
            'key' => 'group_' . $groupName,
            'title' => $groupName,
            'fields' => array(),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'shelterapp_animals',
                    ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'hide_on_screen' => '',
            'active' => true,
            'description' => '',
            'show_in_rest' => 0,
        );

        foreach ($fields as $field) {
            foreach ($animalSchema as $key => $_value) {
                if ($field !== $key) {
                    continue;
                }
                $value = $animalSchema[$key];
                if (isset($value['allOf']) && is_array($value['allOf']) && count($value['allOf']) > 0) {
                    $entry = $value['allOf'][0];
                    if (isset($entry['$ref'])) {
                        $value['$ref'] = $entry['$ref'];
                    }
                }
                if (isset($value['$ref'])) {
                    $name = basename($value['$ref']);
                    $ref = $schema['components']['schemas'][$name];
                    if ($name === 'LocalDate') {
                        $value['type'] = 'date';
                        $group['fields'][] = $this->getFieldOfType($required, $value['type'], $key);
                    } else if ($name === 'LocalDateTime') {
                        $value['type'] = 'datetime';
                        $group['fields'][] = $this->getFieldOfType($required, $value['type'], $key);
                    } else if (isset($ref['enum'])) {
                        // this is a enum!
                        $field = array(
                            'key' => 'field_' . $key,
                            'label' => $key,
                            'name' => $key,
                            'aria-label' => $key,
                            'type' => 'select',
                            'instructions' => '',
                            'required' => in_array($key, $required) ? 1 : 0,
                            'conditional_logic' => 0,
                            'wrapper' => array(
                                'width' => '',
                                'class' => '',
                                'id' => '',
                            ),
                            'choices' => array_combine($ref['enum'], $ref['enum']),
                            'default_value' => '',
                            'allow_null' => 0,
                            'multiple' => 0,
                            'ui' => 0,
                            'ajax' => 0,
                            'placeholder' => '',
                            'return_format' => 'value',
                        );
                        $group['fields'][] = $field;
                    } else {
                        out($value);
                    }

                    continue;
                }

                $group['fields'][] = $this->getFieldOfType($required, $value['type'], $key);
            }

        }

        acf_add_local_field_group($group);
    }

    function getFieldOfType(
        array &$required,
        string $type,
        string $key,
    ) {
        switch ($type) {
            case 'string':
            case 'array':
                $field = array(
                    'key' => 'field_' . $key,
                    'label' => $key,
                    'name' => $key,
                    'aria-label' => $key,
                    'type' => 'text',
                    'instructions' => '',
                    'required' => in_array($key, $required) ? 1 : 0,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '',
                        'class' => '',
                        'id' => '',
                    ),
                    'default_value' => '',
                    'placeholder' => '',
                    'prepend' => '',
                    'append' => '',
                    'maxlength' => '',
                );
                return $field;
            case 'integer':
            case 'number':
                $field = array(
                    'key' => 'field_' . $key,
                    'label' => $key,
                    'name' => $key,
                    'aria-label' => $key,
                    'type' => 'number',
                    'instructions' => '',
                    'required' => in_array($key, $required) ? 1 : 0,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '',
                        'class' => '',
                        'id' => '',
                    ),
                    'default_value' => '',
                    'placeholder' => '',
                    'prepend' => '',
                    'append' => '',
                    'min' => '',
                    'max' => '',
                    'step' => '',
                );
                return $field;
            case 'datetime':
                $field = array(
                    'key' => 'field_' . $key,
                    'label' => $key,
                    'name' => $key,
                    'aria-label' => $key,
                    'type' => 'datetime',
                    'instructions' => '',
                    'required' => in_array($key, $required) ? 1 : 0,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '',
                        'class' => '',
                        'id' => '',
                    ),
                    'display_format' => 'd.m.Y',
                    'return_format' => 'Y-m-d',
                    'first_day' => 1,
                );
                return $field;
            case 'date':
                $field = array(
                    'key' => 'field_' . $key,
                    'label' => $key,
                    'name' => $key,
                    'aria-label' => $key,
                    'type' => 'date_picker',
                    'instructions' => '',
                    'required' => in_array($key, $required) ? 1 : 0,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '',
                        'class' => '',
                        'id' => '',
                    ),
                    'display_format' => 'd.m.Y',
                    'return_format' => 'Y-m-d',
                    'first_day' => 1,
                );
                return $field;
            case 'boolean':
                $field = array(
                    'key' => 'field_' . $key,
                    'label' => $key,
                    'name' => $key,
                    'aria-label' => $key,
                    'type' => 'true_false',
                    'instructions' => '',
                    'required' => in_array($key, $required) ? 1 : 0,
                    'conditional_logic' => 0,
                    'wrapper' => array(
                        'width' => '',
                        'class' => '',
                        'id' => '',
                    ),
                    'message' => '',
                    'default_value' => 0,
                    'ui' => 0,
                    'ui_on_text' => '',
                    'ui_off_text' => '',
                );
                return $field;
            default:
                throw new \Exception('Unknown type: ' . $type);
        }
    }

    function getAllAnimals(OpenAPI\Client\Api\AnimalResourceApi $client, array &$allAnimals, int $chunksize = 50, int $page = 0)
    {
        if ($page > 100) {
            throw new \Exception('To many pages');
        }
        $animals = $client->animalsGet(page: $page, page_size: $chunksize);
        array_push($allAnimals, ...$animals);
        if (count($animals) < $chunksize) {
            return;
        }
        $this->getAllAnimals($client, $allAnimals, $chunksize, $page + 1);
    }

    /**
     * @return \OpenAPI\Client\Model\Animal[]
     */
    function initAnimalArray()
    {
        return array();
    }

    function sync()
    {
        // return;
        error_log('=============================================================');
        error_log('SYNCING');
        $client = sa_get_animal_resource_client();
        if (!$client) {
            error_log('Could not get client, no token or token expired.');
            return;
        }
        $animals = $this->initAnimalArray();
        $this->getAllAnimals($client, $animals);

        foreach ($animals as $animal) {
            sa_sync_ensure_term($animal->getType());
            sa_sync_ensure_illnesses($animal->getIllnesses());
            sa_sync_ensure_allergies($animal->getAllergies());

            $args = array(
                'meta_key' => 'shelterapp_id',
                'meta_value' => $animal->getId(),
                'post_type' => 'shelterapp_animals',
                'post_status' => 'any',
                'posts_per_page' => -1
            );
            $posts = get_posts($args);
            if (count($posts) > 0) {
                // we already have a post with this link id!
                sa_sync_update_animal($animal, $posts[0]);
            } else {
                sa_sync_insert_animal($animal);
            }
        }
    }
}

global $SHELTERAPP_GLOBAL_ANIMAL;
$SHELTERAPP_GLOBAL_ANIMAL = new ShelterappAnimals();



function wporg_add_custom_box()
{
    $screens = ['shelterapp_animals'];
    foreach ($screens as $screen) {
        add_meta_box('postimagegalery', 'Galerie', 'wporg_custom_box_html', null, 'side', 'low', array('__back_compat_meta_box' => true));
    }
}
add_action('add_meta_boxes', 'wporg_add_custom_box');

function wporg_custom_box_html($post)
{
    wp_enqueue_script('wporg_custom_js', plugin_dir_url(SHELTERAPP_PATH) . 'js/imageGalery.js', array('jquery'), '1.0', true);
    $galery_ids = get_post_meta($post->ID, 'galery_ids', true);
    // echo _wporg_custom_box_html($galery_ids, $post->ID);
}

function _wporg_custom_box_html($thumbnail_id = null, $post = null)
{
    $_wp_additional_image_sizes = wp_get_additional_image_sizes();

    $post = get_post($post);
    $post_type_object = get_post_type_object($post->post_type);
    $set_thumbnail_link = '<p class="hide-if-no-js"><a href="%s" id="set-post-thumbnail"%s class="thickbox">%s</a></p>';
    $upload_iframe_src = get_upload_iframe_src('image', $post->ID);

    $content = sprintf(
        $set_thumbnail_link,
        esc_url($upload_iframe_src),
        '', // Empty when there's no featured image set, `aria-describedby` attribute otherwise.
        esc_html($post_type_object->labels->set_featured_image)
    );

    if ($thumbnail_id && get_post($thumbnail_id)) {
        $size = isset($_wp_additional_image_sizes['post-thumbnail']) ? 'post-thumbnail' : array(266, 266);

        /**
         * Filters the size used to display the post thumbnail image in the 'Featured image' meta box.
         *
         * Note: When a theme adds 'post-thumbnail' support, a special 'post-thumbnail'
         * image size is registered, which differs from the 'thumbnail' image size
         * managed via the Settings > Media screen.
         *
         * @since 4.4.0
         *
         * @param string|int[] $size         Requested image size. Can be any registered image size name, or
         *                                   an array of width and height values in pixels (in that order).
         * @param int          $thumbnail_id Post thumbnail attachment ID.
         * @param WP_Post      $post         The post object associated with the thumbnail.
         */
        $size = apply_filters('admin_post_thumbnail_size', $size, $thumbnail_id, $post);

        $thumbnail_html = wp_get_attachment_image($thumbnail_id, $size);

        if (!empty($thumbnail_html)) {
            $content = sprintf(
                $set_thumbnail_link,
                esc_url($upload_iframe_src),
                ' aria-describedby="set-post-thumbnail-desc"',
                $thumbnail_html
            );
            $content .= '<p class="hide-if-no-js howto" id="set-post-thumbnail-desc">' . __('Click the image to edit or update') . '</p>';
            $content .= '<p class="hide-if-no-js"><a href="#" id="remove-post-thumbnail">' . esc_html($post_type_object->labels->remove_featured_image) . '</a></p>';
        }
    }

    $content .= '<input type="hidden" id="_thumbnail_id" name="_thumbnail_id" value="' . esc_attr($thumbnail_id ? $thumbnail_id : '-1') . '" />';

    /**
     * Filters the admin post thumbnail HTML markup to return.
     *
     * @since 2.9.0
     * @since 3.5.0 Added the `$post_id` parameter.
     * @since 4.6.0 Added the `$thumbnail_id` parameter.
     *
     * @param string   $content      Admin post thumbnail HTML markup.
     * @param int      $post_id      Post ID.
     * @param int|null $thumbnail_id Thumbnail attachment ID, or null if there isn't one.
     */
    return apply_filters('admin_post_thumbnail_html', $content, $post->ID, $thumbnail_id);
}