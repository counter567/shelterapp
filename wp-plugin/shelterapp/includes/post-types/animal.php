<?php
defined('ABSPATH') or die("");
global $preventPreGetPosts;
$preventPreGetPosts = false;

class SaDateTime extends DateTime
{
    function format($format) {
        return parent::format('Y-m-d\\TH:i:s');
    }
}

class ShelterappAnimals
{
    private $rest_is_init = false;
    public $blockView = 0;

    function __construct()
    {
        // plugin init hooks
        add_action('init', array($this, 'register_post_type'), 100);
        add_action('init', array($this, 'ensureAnimalPage'), 100);
        // add_action('admin_menu', array($this, 'setup_admin'));
        add_action('rest_api_init', array($this, 'init_rest'));
        $this->register_custom_fields();

        // admin editor hooks
        add_action('save_post', array($this, 'save_post'), 10, 3);
        add_action('add_meta_boxes', 'sa_add_custom_box_animal_galery');

        // template stuff
        add_filter('template_include', array($this, 'loadAnimalTemplatesNonBlockTheme'), 99);
        add_filter('archive_template', array($this, 'loadAnimalArchiveTemplate'));
        add_filter('single_template', array($this, 'loadAnimalSingleTemplate'));

        // blocks, widgets, shortcodes
        add_action( 'elementor/widgets/register', array($this, 'register_elementor_widget') );
        add_shortcode('shelterapp_view', array($this, 'doShortcode'));

        // cronjob stuff
        add_filter( 'cron_schedules', array($this, 'example_add_cron_interval'), 99);
        add_action( 'sa_cron_perform_sync', array($this, 'cron_perform_sync') );

        // ensure cronjob is set
        if( !wp_next_scheduled( 'sa_cron_perform_sync' ) ){
            wp_schedule_event( time(), 'five_minutes', 'sa_cron_perform_sync' );
        }
    }

    function example_add_cron_interval( $schedules ) {
        $schedules['five_minutes'] = array(
            'interval' => 1, //*60,
            'display' => esc_html__( 'Every Five Minutes' ),
        );
        return $schedules;
    }

    function register_elementor_widget( $widgets_manager ) {

        require_once( plugin_dir_path(SHELTERAPP_PATH) . '/widgets/shelterapp_elementor_widget.php' );
    
        $widgets_manager->register( new \Shelterapp_Elementor_Widget() );
    
    }

    function doShortcode($atts, $content = ""){
        ob_start();
        if(isset($atts['type']) && !empty($atts['type'])) $attributes['type'] = $atts['type'];
        if(isset($atts['status']) && !empty($atts['status'])) $attributes['status'] = $atts['status'];
        include (plugin_dir_path(SHELTERAPP_PATH) . 'blocks/shelter-block-view/render.php');
        return ob_get_clean();
    }

    function setCurrentTemplateContent($additionalContent = '')
    {
        global $_wp_current_template_content;
        $_wp_current_template_content = '<!-- wp:template-part {"slug":"header"} /-->
        
        ' . $additionalContent . '

        <!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
        <div class="wp-block-group alignfull">
            <!-- wp:group {"tagName":"main","align":"wide","layout":{"type":"constrained"}} -->
            <main class="wp-block-group alignwide">
                <!-- wp:create-block/shelter-block-view /-->
            </main>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
        
        <!-- wp:template-part {"slug":"footer"} /-->';
    }

    function loadAnimalArchiveTemplate($page_template){
        if (is_post_type_archive('shelterapp_animals')) {
            if (function_exists('wp_is_block_theme') && wp_is_block_theme()) {
                $id = get_option('sa_page_animal_archive', false);
                $additionalContent = '';
                if ($id) {
                    $page = get_post($id);
                    $additionalContent = $page->post_content;
                }
                $this->setCurrentTemplateContent($additionalContent);
            }
        }
        return $page_template;
    }

    function loadAnimalSingleTemplate($page_template){
        if (is_singular('shelterapp_animals')) {
            if (function_exists('wp_is_block_theme') && wp_is_block_theme()) {
                $id = get_option('sa_page_animal_archive', false);
                $additionalContent = '';
                if ($id) {
                    $page = get_post($id);
                    $additionalContent = $page->post_content . "
                    <style>
.image-gallery-slide-wrapper {aspect-ratio: 1 / 1; padding-top: 100%;}
.image-gallery-swipe {position: absolute; inset: 0;}
.image-gallery-swipe, .image-gallery-slides, .image-gallery-slides > div {height: 100%; background: #eeeeee}
.image-gallery-slides > div {display: flex; place-content: center;}
.image-gallery-slides > div > img {max-height: 100% !important;}
                    </style>
                    ";
                }
                $this->setCurrentTemplateContent($additionalContent);
            }
        }
        return $page_template;
    }

    function loadAnimalTemplatesNonBlockTheme($template)
    {
        if (is_post_type_archive('shelterapp_animals')) {
            if (!function_exists('wp_is_block_theme') || !wp_is_block_theme()) {
                $new_template = plugin_dir_path(SHELTERAPP_PATH) . 'templates/archive-animal.php';
                if ('' != $new_template) {
                    return $new_template;
                }
            }
        }
        if (is_singular('shelterapp_animals')) {
            if (!function_exists('wp_is_block_theme') || !wp_is_block_theme()) {
                $new_template = plugin_dir_path(SHELTERAPP_PATH) . 'templates/single-animal.php';
                if ('' != $new_template) {
                    return $new_template;
                }
            }
        }
        return $template;
    }

    function ensureAnimalPage()
    {
        if (!get_option('sa_page_animal_archive', false)) {
            $page = array(
                'post_title' => 'Tiere',
                'post_name' => 'animal',

                'post_content' => '',
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_excerpt' => '',
                'comment_status' => 'closed',
                'to_ping' => '',
                'pinged' => '',
            );
            $page_id = wp_insert_post($page);
            update_option('sa_page_animal_archive', $page_id);
        }
    }

    /**
     * @param int $post_id
     * @param WP_Post $post
     * @param bool $update
     */
    function save_post(int $post_id, $post, $update)
    {
        $post_value = $_POST['otherPictureFileUrls'];
        update_post_meta($post->ID, 'otherPictureFileUrls', $post_value);

        outLog('saving a post! Update to backend!');
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
                        'nonce' => wp_create_nonce('wp_rest'),
                        'publicUrlBase' => plugin_dir_url(SHELTERAPP_PATH) . 'public'
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

        $meta['mainPictureFileUrl'] = wp_get_attachment_url(get_post_meta($post_id, '_thumbnail_id', true));
        $images = get_post_meta($post_id, 'otherPictureFileUrls', true);
        $meta['otherPictureFileUrls'] = array();
        if (isset($images) && is_array($images) && count($images) > 0) {
            foreach ($images as $image) {
                $meta['otherPictureFileUrls'][] = array(
                    'meta' => wp_get_attachment_metadata($image),
                    'url' => wp_get_attachment_url($image),
                    'thumbnailUrl' => wp_get_attachment_image_url($image, 'medium'),
                );
            }
        }

        global $filteredMetaFields;
        foreach ($filteredMetaFields as $filed) {
            unset($meta[$filed]);
        }

        // @todo: Filter out private fields

        return $meta;
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
            'has_archive' => true,
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
            null,
            true,
            false,
            true,
            false
        );
        sa_generate_taxonomy(
            'shelterapp_animal_illness',
            array('shelterapp_animals'),
            'Tier Krankheit',
            'Tier Krankheiten',
            null,
            false,
            false,
            false,
            false
        );
        sa_generate_taxonomy(
            'shelterapp_animal_allergies',
            array('shelterapp_animals'),
            'Tier Allergie',
            'Tier Allergien',
            null,
            false,
            false,
            false,
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

        if( !wp_next_scheduled( 'sa_cron_perform_sync' ) ){
            wp_schedule_event( time(), 'five_minutes', 'sa_cron_perform_sync' );
        }
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

        if( wp_next_scheduled( 'sa_cron_perform_sync' ) ){
            wp_clear_scheduled_hook( 'sa_cron_perform_sync' );
        }
    }

    function register_custom_fields()
    {
        if (!function_exists('acf_add_local_field_group')) {
            return;
        }

        $file = file_get_contents(dirname(__FILE__) . '/../../openapi.json');
        $schema = json_decode($file, true);
        $animalSchema = $schema['components']['schemas']['Animal']['properties'];
        $required = $schema['components']['schemas']['Animal']['required'];

        $this->get_custom_input_group('Stammdaten', 10, [
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

        $this->get_custom_input_group('Maße', 20, [
            'weight',
            'heightAtWithers',
            'circumferenceOfNeck',
            'lengthOfBack',
            'circumferenceOfChest',
        ], $animalSchema, $schema, $required);

        $this->get_custom_input_group('Shelter Interner', 30, [
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

        $this->get_custom_input_group('Medizinisches', 40, [
            'castrated',
            'bloodType',
        ], $animalSchema, $schema, $required);

        /*
        mainPictureFileUrl
        otherPictureFileUrls
        */
    }

    function get_custom_input_group(string $groupName, int $order, array $fields, $animalSchema, $schema, $required)
    {
        global $titleMappings;
        $group = array(
            'key' => 'group_' . sanitize_title($groupName),
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
                            'label' => isset($titleMappings[$key]) ? $titleMappings[$key] : $key,
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
                        outLog($value);
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
        global $titleMappings;
        switch ($type) {
            case 'string':
            case 'array':
                $filedAsArea = array('notes', 'description', 'internalNotes');
                $field = array(
                    'key' => 'field_' . $key,
                    'label' => isset($titleMappings[$key]) ? $titleMappings[$key] : $key,
                    'name' => $key,
                    'aria-label' => $key,
                    'type' => in_array($key, $filedAsArea) ? 'textarea' : 'text',
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
                    'label' => isset($titleMappings[$key]) ? $titleMappings[$key] : $key,
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
                    'label' => isset($titleMappings[$key]) ? $titleMappings[$key] : $key,
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
                    'label' => isset($titleMappings[$key]) ? $titleMappings[$key] : $key,
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
                    'label' => isset($titleMappings[$key]) ? $titleMappings[$key] : $key,
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

    function getAllAnimalsFromDate(OpenAPI\Client\Api\AnimalResourceApi $client, array &$allAnimals, int $chunksize = 50, int $page = 0)
    {
        if ($page > 100) {
            throw new \Exception('To many pages');
        }
        $options = sa_get_config();
        if (isset($options['shelterapp_sync_from'])) {
            // get all updates from date.
            $date = SaDateTime::createFromFormat('U', $options['shelterapp_sync_from']);
            $date->setTimezone(new DateTimeZone("UTC"));
            error_log('Update animals from date: ' . $date->format('Y-m-d\\TH:i:s'));

            // update shelterapp_sync_from
            $date2 = new DateTime('now', new DateTimeZone("UTC"));
            $options['shelterapp_sync_from'] = $date2->getTimestamp();
            sa_set_config($options);

            return $this->_getAllAnimalsFromDate($client, $date, $allAnimals, $chunksize, $page);
        } else {
            // init with all animals
            error_log('Get all animals!');

            // update shelterapp_sync_from
            $date = new DateTime('now', new DateTimeZone("UTC"));
            $options['shelterapp_sync_from'] = $date->getTimestamp();
            sa_set_config($options);

            return $this->_getAllAnimalsFromDate($client, null, $allAnimals, $chunksize, $page);
        }
    }
    function _getAllAnimalsFromDate(OpenAPI\Client\Api\AnimalResourceApi $client, DateTime $date = null, array &$allAnimals, int $chunksize = 50, int $page = 0)
    {
        if ($page > 100) {
            throw new \Exception('To many pages');
        }
        if (isset($date) && !empty($date)) {
            // get all updates from date.
            $animals = $client->animalsGet(page: $page, page_size: $chunksize, updated_after: $date);
        } else {
            // init with all animals
            $animals = $client->animalsGet(page: $page, page_size: $chunksize);
        }
        // error_log(count($animals));
        array_push($allAnimals, ...$animals);
        if (count($animals) < $chunksize) {
            return;
        }
        $this->_getAllAnimalsFromDate($client, $date, $allAnimals, $chunksize, $page + 1);
    }

    function cron_perform_sync()
    {
        error_log('============================================');
        $client = sa_get_animal_resource_client();
        if (!$client) {
            outLog('Could not get client, no token or token expired.');
            return;
        }

        /** @var \OpenAPI\Client\Model\Animal[] */
        $animals = array();
        $this->getAllAnimalsFromDate($client, $animals);

        if (isset($animals) && is_array($animals) && !empty($animals)) {
            outLog('updating animals from shelterapp backend');
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
                    // outLog('Update animal: ' . $animal->getId());
                    sa_sync_update_animal($animal, $posts[0]);
                } else {
                    // outLog('Insert new animal: ' . $animal->getId());
                    sa_sync_insert_animal($animal);
                }
            }
        }

        $args = array(
            'meta_key' => 'shelterapp_id',
            'meta_value' => '',
            'post_type' => 'shelterapp_animals',
            'post_status' => 'any',
            'posts_per_page' => -1
        );
        $posts = get_posts($args);
        outLog('check for orphaned animals');
        outLog(count($posts));
    }
}

global $SHELTERAPP_GLOBAL_ANIMAL;
$SHELTERAPP_GLOBAL_ANIMAL = new ShelterappAnimals();

function custom_display_post_states($states, $post)
{
    $id = get_option('sa_page_animal_archive', false);
    if ($id && $post->ID == $id) {
        $states['page_for_animals'] = 'Seite für Tiere';
    }
    return $states;
}

add_filter('display_post_states', 'custom_display_post_states', 10, 2);

$filteredMetaFields = [
    'internalNotes'
];

$titleMappings = array(
    'dateOfBirth' => 'Geburtstag',
    'sex' => 'Geschlecht',
    'color' => 'Farbe',
    'breedOne' => 'Hauptrasse',
    'breedTwo' => 'Nebenrasse',
    'chipNumber' => 'Chip Nummer',
    'description' => 'Beschreibung',
    'wasFound' => 'Wurde gefunden',
    'missing' => 'Wird vermisst',
    'weight' => 'Gewicht',
    'heightAtWithers' => 'Widerristhöhe',
    'circumferenceOfNeck' => 'Halsumfang',
    'lengthOfBack' => 'Rückenlänge',
    'circumferenceOfChest' => 'Brustumfang',
    'dateOfAdmission' => 'Aufnahmedatum',
    'dateOfLeave' => 'Abgabedatum',
    'dateOfDeath' => 'Todesdatum',
    'status' => 'Status',
    'notes' => 'Notizen',
    'internalNotes' => 'Interne Notizen',
    'donationCall' => 'Spendenaufruf',
    'successStory' => 'Erfolgsgeschichte',
    'privateAdoption' => 'Private Adoption',
    'castrated' => 'Kastriert',
    'bloodType' => 'Blutgruppe',
);
