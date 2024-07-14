<?php
defined('ABSPATH') or die("");
global $preventPreGetPosts;
$preventPreGetPosts = false;

global $importedAnimals;
$importedAnimals = 0;

class SaDateTime extends DateTime
{
    function format($format) {
        return parent::format('Y-m-d\\TH:i:s');
    }
}

class ShelterappAnimals
{
    private $isSyncing = false;
    private $rest_is_init = false;
    public $blockView = 0;

    function __construct()
    {
        // plugin init hooks
        add_action('init', array($this, 'register_post_type'), 100);
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
        add_filter( 'cron_schedules', array($this, 'example_add_cron_interval'), 1000);
        add_action( 'sa_cron_perform_sync', array($this, 'cron_perform_sync') );

        // check if the wp-cron.php is executed
        if(isDebug()) {
            // define stub for cronjob
            add_action( 'sa_cron_perform_sync', function(){} );
            // always call the cronjob
            add_action('init', function(){
                if (defined('DOING_CRON') && DOING_CRON) {
                    outLog('Doing cron');
                    $this->cron_perform_sync();
                }
            }, 101);
        } else {
            // define cron job callback
            add_action( 'sa_cron_perform_sync', array($this, 'cron_perform_sync') );
            // ensure cronjob is set
            if( !wp_next_scheduled( 'sa_cron_perform_sync' ) ){
                wp_schedule_event( time(), 'five_minutes', 'sa_cron_perform_sync' );
            }
        }

        add_filter( 'rest_shelterapp_animals_query', array($this, 'filter_posts'), 999, 2 );
        
        
    }

    function filter_posts( $args, $request ) {
        if ( isset( $args['meta_query'] ) ) {
            $args['meta_query']['relation'] = 'AND';
        }
        
        if(isset( $request['meta_status'] )) {
            $status_value = json_decode(sanitize_text_field( $request['meta_status'] ));
            $statusCompare = '=';
            if(is_array($status_value)){
                $statusCompare = 'IN';
            }
            $meta_query = array(
                'key' => 'status',
                'value' => $status_value,
                'compare' => $statusCompare,
            );
            $args['meta_query'][] = $meta_query;
        }
        if(isset( $request['meta_sex'] )) {
            $status_value = sanitize_text_field( $request['meta_sex'] );
            $meta_query = array(
                'key' => 'sex',
                'value' => $status_value,
                'compare' => '=',
            );
            $args['meta_query'][] = $meta_query;
        }
        
        if(isset( $request['meta_age_max'] )) {
            $maxAge = (int)sanitize_text_field( $request['meta_age_max'] );
            $meta_query = array(
                'key' => 'dateOfBirth',
                'value' => date('Y-m-d', strtotime("-$maxAge years")),
                'compare' => '>',
            );
            $args['meta_query'][] = $meta_query;
        }
        if(isset( $request['meta_age_min'] )) {
            $minAge = ((int)sanitize_text_field( $request['meta_age_min'] )) -1;
            $meta_query = array(
                'key' => 'dateOfBirth',
                'value' => date('Y-m-d', strtotime("-$minAge years")),
                'compare' => '<',
            );
            $args['meta_query'][] = $meta_query;
        }
        if(isset( $request['meta_private_adoption'] )) {
            $wasFound = ((boolean)sanitize_text_field( $request['meta_private_adoption'] ));
            $meta_query = array(
                'key' => 'privateAdoption',
                'value' => $wasFound ? '1' : '0',
                'compare' => '=',
            );
            $args['meta_query'][] = $meta_query;
        }
        if(isset( $request['meta_was_found'] )) {
            $wasFound = ((boolean)sanitize_text_field( $request['meta_was_found'] ));
            $meta_query = array(
                'key' => 'wasFound',
                'value' => $wasFound ? '1' : '0',
                'compare' => '=',
            );
            $args['meta_query'][] = $meta_query;
        }
        if(isset( $request['meta_missing'] )) {
            $wasFound = ((boolean)sanitize_text_field( $request['meta_missing'] ));
            $meta_query = array(
                'key' => 'missing',
                'value' => $wasFound ? '1' : '0',
                'compare' => '=',
            );
            $args['meta_query'][] = $meta_query;
        }
        if(isset( $request['meta_private_adoption'] )) {
            $privateAdoption = ((boolean)sanitize_text_field( $request['meta_private_adoption'] ));
            $meta_query = array(
                'key' => 'privateAdoption',
                'value' => $privateAdoption ? '1' : '0',
                'compare' => '=',
            );
            $args['meta_query'][] = $meta_query;
        }
        return $args;
    }

    function example_add_cron_interval( $schedules ) {
        $schedules['five_minutes'] = array(
            'interval' => 5*60,
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
        if($this->isSyncing) {
            return;
        }
        if($post->post_type !== 'shelterapp_animals'){
            return;
        }
        
        $post_value = $_POST['otherPictureFileUrls'];
        if(isset($post_value)) {
            update_post_meta($post->ID, 'otherPictureFileUrls', $post_value);
        }

        outLog('***********************************************');
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
        register_rest_route(
            'sa/v1',
            '/update',
            array(
                'login_user_id' => get_current_user_id(), // This will be pass to the rest API callback
                'methods' => 'GET',
                'callback' => function ($data) {
                    $attrs =  $data->get_attributes();
                    if( !isset($attrs['login_user_id']) || intval($attrs['login_user_id']) === 0  ) {
                        return array (
                            'success' => false,
                        );
                    }
                    $user_id        = intval($attrs['login_user_id']);
                    $current_user   = get_user_by( 'id', $user_id );
                    if ($current_user === false || $current_user === null || !in_array('administrator', $current_user->roles)) {
                        return array (
                            'success' => false,
                        );
                    }
                    if(isset($_GET['delete']) && is_user_admin()) {
                        $args = array(
                            'post_type' => 'shelterapp_animals',
                            'post_status' => 'any',
                            'posts_per_page' => -1,
                        );
                        $posts = get_posts($args);
                        foreach ($posts as $post) {
                            // delete the post
                            wp_delete_post($post->ID, true);
                        }
                    }
                    $success = false;
                    $success = $this->cron_perform_sync();
                    global $importedAnimals;
                    return array (
                        'success' => $success,
                        'processed' => $importedAnimals,
                        'data' => $_GET,
                        'current_user' => $current_user,
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
            if(str_starts_with('_', $key)){
                unset($meta[$key]);
                continue;
            }
            if ($key === 'search-data') {
                continue;
            }
            $meta[$key] = get_field($key, $post_id);
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

        unset($meta['chipNumber']);
        unset($meta['internalNotes']);
        unset($meta['public']);

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

    function cron_perform_sync()
    {
        $this->isSyncing = true;
        error_log('============================================');

        if(isDebug()){
            error_log('Delete old animals...');
            // @REMOVE: clear animals for debug
            $args = array(
                'post_type' => 'shelterapp_animals',
                'post_status' => 'any',
                'posts_per_page' => -1,
            );
            $posts = get_posts($args);
            foreach ($posts as $post) {
                // delete the post
                wp_delete_post($post->ID, true);
            }
        }

        error_log('Import animals...');
        try{
            sa_sync_sync_animals();
            return true;
        } catch(Exception $e) {
            outLog('There was an error during sync:');
            outLog($e->getMessage());
            outLog(array_map(function($entry){
                return $entry['function'];
            }, $e->getTrace()));
            $this->isSyncing = false;
            return false;
        }
    }
}

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

global $titleMappings;
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


// delte all attachments of post of type shelterapp_animals on delete
add_action('before_delete_post', function($post_id){
    $post = get_post($post_id);
    if($post->post_type === 'shelterapp_animals'){
        outLog('Deleting all attachments of post ' . $post_id);
        $attachments = get_attached_media('image', $post_id);
        foreach ($attachments as $attachment) {
            wp_delete_attachment($attachment->ID, true);
        }
    }
    $shelterapp_id = get_post_meta($post_id, 'shelterapp_id', true);
    if(isset($shelterapp_id) && !empty($shelterapp_id)) {
        outLog('Delete animal with id ' . $shelterapp_id);
        try{
            sa_sync_delete_animal($shelterapp_id);
        } catch(Exception $e) {
            outLog('There was an error during delete:');
            outLog($e->getMessage());
            outLog(array_map(function($entry){
                return $entry['function'];
            }, $e->getTrace()));
        }
    }
});


global $SHELTERAPP_GLOBAL_ANIMAL;
$SHELTERAPP_GLOBAL_ANIMAL = new ShelterappAnimals();
