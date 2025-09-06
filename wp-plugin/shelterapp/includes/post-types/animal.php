<?php
defined('ABSPATH') or die("");
global $preventPreGetPosts;
$preventPreGetPosts = false;

global $importedAnimals;
$importedAnimals = 0;

class SaDateTime extends DateTime
{
    #[\ReturnTypeWillChange]
    function format($format) {
        return parent::format('Y-m-d\\TH:i:s');
    }
}

class ShelterappAnimals
{
    private $rest_is_init = false;
    public $blockView = 0;

    private $openapi_schema = null;
    private $openapi_animal_schema = null;


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

        add_filter( 'rest_shelterapp_animals_query', array($this, 'filter_posts'), 999, 2 );
        add_filter( 'manage_edit-shelterapp_animals_sortable_columns', array($this, 'sortable_columns') );

        add_action('restrict_manage_posts', array($this, 'add_admin_list_filters'));
        add_action('pre_get_posts', array($this, 'apply_admin_list_filters'));

    }

    // ---------------------------
    // OpenAPI helpers (shared with filters)
    // ---------------------------

    private function load_openapi_schema(): void
    {
        if ($this->openapi_schema !== null && $this->openapi_animal_schema !== null) {
            return;
        }
        $file = @file_get_contents(dirname(__FILE__) . '/../../openapi.json');
        if ($file === false) {
            $this->openapi_schema = null;
            $this->openapi_animal_schema = null;
            return;
        }
        $schema = json_decode($file, true);
        if (!is_array($schema)) {
            $this->openapi_schema = null;
            $this->openapi_animal_schema = null;
            return;
        }
        $this->openapi_schema = $schema;
        $this->openapi_animal_schema = $schema['components']['schemas']['Animal']['properties'] ?? null;
    }

    private function get_field_definition(string $fieldKey): ?array
    {
        $this->load_openapi_schema();
        if (!$this->openapi_animal_schema || !isset($this->openapi_animal_schema[$fieldKey])) {
            return null;
        }
        $def = $this->openapi_animal_schema[$fieldKey];

        // Resolve $ref in allOf if present (similar to register_custom_fields)
        if (isset($def['allOf']) && is_array($def['allOf']) && count($def['allOf']) > 0) {
            $entry = $def['allOf'][0];
            if (isset($entry['$ref'])) {
                $def['$ref'] = $entry['$ref'];
            }
        }
        return $def;
    }

    private function resolve_ref(array $def): ?array
    {
        $this->load_openapi_schema();
        if (!isset($def['$ref']) || !$this->openapi_schema) {
            return null;
        }
        $name = basename($def['$ref']);
        return $this->openapi_schema['components']['schemas'][$name] ?? null;
    }

    private function translate_enum_label(string $fieldKey, string $value): string
    {
        if ($fieldKey === 'status') {
            // German labels for the status enum
            static $labels = array(
                'NEW'             => 'Neu',
                'SEARCHING'       => 'Suchend',
                'REQUEST_STOP'    => 'Anfrage gestoppt',
                'EMERGENCY'       => 'Notfall',
                'RESERVED'        => 'Reserviert',
                'ADOPTED'         => 'Vermittelt',
                'FINAL_CARE'      => 'Endpflege',
                'COURT_OF_GRACE'  => 'Gnadenhof',
                'DECEASED'        => 'Verstorben',
            );
            return $labels[$value] ?? $value;
        }

        // Default: return raw value if no translation exists
        return $value;
    }


    private function get_enum_choices(string $fieldKey): array
    {
        $def = $this->get_field_definition($fieldKey);
        if (!$def) return [];

        // direct enum on field
        if (isset($def['enum']) && is_array($def['enum'])) {
            // return as value => label
            return array_combine($def['enum'], $def['enum']);
        }

        // enum via $ref
        $ref = $this->resolve_ref($def);
        if ($ref && isset($ref['enum']) && is_array($ref['enum'])) {
            return array_combine($ref['enum'], $ref['enum']);
        }

        return [];
    }

    private function get_field_type(string $fieldKey): ?string
    {
        $def = $this->get_field_definition($fieldKey);
        if (!$def) return null;

        // check $ref types you mapped in register_custom_fields
        if (isset($def['allOf']) && is_array($def['allOf']) && count($def['allOf']) > 0) {
            $entry = $def['allOf'][0];
            if (isset($entry['$ref'])) {
                $def['$ref'] = $entry['$ref'];
            }
        }
        if (isset($def['$ref'])) {
            $ref = $this->resolve_ref($def);
            if ($ref) {
                // Map special refs you used in register_custom_fields
                $name = basename($def['$ref']);
                if ($name === 'LocalDate') return 'date';
                if ($name === 'LocalDateTime') return 'datetime';
                if (isset($ref['enum'])) return 'enum';
            }
        }

        // fallback to native type
        return $def['type'] ?? null;
    }




    function add_admin_list_filters()
    {
        global $typenow;
        if ($typenow !== 'shelterapp_animals') {
            return;
        }

        // Status select from OpenAPI enum, labels translated
        $status_selected = isset($_GET['sa_meta_status']) ? sanitize_text_field($_GET['sa_meta_status']) : '';
        $status_choices = $this->get_enum_choices('status');

        if (!empty($status_choices)) {
            ?>
            <select name="sa_meta_status">
                <option value=""><?php esc_html_e('Alle Status', 'shelterapp'); ?></option>
                <?php foreach ($status_choices as $val => $_rawLabel): ?>
                    <?php $label = $this->translate_enum_label('status', $val); ?>
                    <option value="<?php echo esc_attr($val); ?>" <?php selected($status_selected, $val); ?>>
                        <?php echo esc_html($label); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <?php
        } else {
            ?>
            <input
                type="text"
                name="sa_meta_status"
                placeholder="<?php esc_attr_e('Status', 'shelterapp'); ?>"
                value="<?php echo esc_attr($status_selected); ?>"
            />
            <?php
        }

        // Optional: also build Sex from enum, if present
        $sex_selected = isset($_GET['sa_meta_sex']) ? sanitize_text_field($_GET['sa_meta_sex']) : '';
        $sex_choices = $this->get_enum_choices('sex');
        if (!empty($sex_choices)) {
            ?>
            <select name="sa_meta_sex">
                <option value=""><?php esc_html_e('Alle Geschlechter', 'shelterapp'); ?></option>
                <?php foreach ($sex_choices as $val => $label): ?>
                    <option value="<?php echo esc_attr($val); ?>" <?php selected($sex_selected, $val); ?>>
                        <?php echo esc_html($label); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <?php
        } else {
            ?>
            <select name="sa_meta_sex">
                <option value=""><?php esc_html_e('Alle Geschlechter', 'shelterapp'); ?></option>
                <option value="Male"   <?php selected($sex_selected, 'Male'); ?>><?php esc_html_e('Männlich', 'shelterapp'); ?></option>
                <option value="Female" <?php selected($sex_selected, 'Female'); ?>><?php esc_html_e('Weiblich', 'shelterapp'); ?></option>
            </select>
            <?php
        }

        // Booleans as dropdowns (from schema types, but simple fixed UI is fine)
        $bool_options = array(
            ''  => __('Alle', 'shelterapp'),
            '1' => __('Ja', 'shelterapp'),
            '0' => __('Nein', 'shelterapp'),
        );

        $selected_pa      = isset($_GET['sa_meta_private_adoption']) ? sanitize_text_field($_GET['sa_meta_private_adoption']) : '';
        $selected_found   = isset($_GET['sa_meta_was_found']) ? sanitize_text_field($_GET['sa_meta_was_found']) : '';
        $selected_missing = isset($_GET['sa_meta_missing']) ? sanitize_text_field($_GET['sa_meta_missing']) : '';

        ?>
        <select name="sa_meta_private_adoption">
            <?php foreach ($bool_options as $val => $label): ?>
                <option value="<?php echo esc_attr($val); ?>" <?php selected($selected_pa, $val); ?>>
                    <?php echo esc_html(sprintf(__('Fremdvermittlung: %s', 'shelterapp'), $label)); ?>
                </option>
            <?php endforeach; ?>
        </select>

        <select name="sa_meta_was_found">
            <?php foreach ($bool_options as $val => $label): ?>
                <option value="<?php echo esc_attr($val); ?>" <?php selected($selected_found, $val); ?>>
                    <?php echo esc_html(sprintf(__('Gefunden: %s', 'shelterapp'), $label)); ?>
                </option>
            <?php endforeach; ?>
        </select>

        <select name="sa_meta_missing">
            <?php foreach ($bool_options as $val => $label): ?>
                <option value="<?php echo esc_attr($val); ?>" <?php selected($selected_missing, $val); ?>>
                    <?php echo esc_html(sprintf(__('Vermisst: %s', 'shelterapp'), $label)); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }


    // ---------------------------
    // Admin List Filters (Query)
    // ---------------------------

    function apply_admin_list_filters($query)
    {
        if (!is_admin() || !$query->is_main_query()) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || $screen->post_type !== 'shelterapp_animals') {
            return;
        }

        $meta_query = array('relation' => 'AND');

        // Status (enum or string)
        if (!empty($_GET['sa_meta_status'])) {
            $meta_query[] = array(
                'key'     => 'status',
                'value'   => sanitize_text_field($_GET['sa_meta_status']),
                'compare' => '='
            );
        }

        // Sex (enum or string)
        if (!empty($_GET['sa_meta_sex'])) {
            $meta_query[] = array(
                'key'     => 'sex',
                'value'   => sanitize_text_field($_GET['sa_meta_sex']),
                'compare' => '='
            );
        }

        // Booleans: privateAdoption, wasFound, missing
        $bool_filters = array(
            'sa_meta_private_adoption' => 'privateAdoption',
            'sa_meta_was_found'        => 'wasFound',
            'sa_meta_missing'          => 'missing',
        );
        foreach ($bool_filters as $param => $meta_key) {
            if (isset($_GET[$param]) && $_GET[$param] !== '') {
                $is_true = $_GET[$param] === '1';
                $meta_query[] = array(
                    'key'     => $meta_key,
                    'value'   => $is_true ? array('1','true') : array('', '0', 'false'),
                    'compare' => 'IN',
                );
            }
        }

        if (count($meta_query) > 1) {
            $query->set('meta_query', $meta_query);
        }
    }



    function sortable_columns($columns) {
        $columns['taxonomy-shelterapp_animal_type'] = 'taxonomy-shelterapp_animal_type';
        return $columns;
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
            $privateAdoption = filter_var(sanitize_text_field( $request['meta_private_adoption'] ), FILTER_VALIDATE_BOOLEAN);
            $meta_query = array(
                'key' => 'privateAdoption',
                'value' => $privateAdoption ? array('1','true') : array('', '0'),
                'compare' => 'IN',
            );
            $args['meta_query'][] = $meta_query;
        }
        if(isset( $request['meta_was_found'] )) {
            $wasFound = filter_var(sanitize_text_field( $request['meta_was_found'] ), FILTER_VALIDATE_BOOLEAN);
            $meta_query = array(
                'key' => 'wasFound',
                'value' => $wasFound ? array('1','true') : array('', '0'),
                'compare' => 'IN',
            );
            $args['meta_query'][] = $meta_query;
        }

        if(isset( $request['meta_missing'] )) {
            $missing = filter_var(sanitize_text_field( $request['meta_missing'] ), FILTER_VALIDATE_BOOLEAN);
            $meta_query = array(
                'key' => 'missing',
                'value' => $missing ? array('1','true') : array('', '0'),
                'compare' => 'IN',
            );
            $args['meta_query'][] = $meta_query;
        }
            if (isset($request['meta_orderby']) && $request['meta_orderby'] != '') {
                $args['meta_type'] = 'DATE';
                $args['meta_key'] = $request['meta_orderby'];
                $args['orderby'] = 'meta_value';
                $args['order'] = isset($request['meta_order']) ? $request['meta_order'] : 'DESC';
            }
        return $args;
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


        if(array_key_exists('otherPictureFileUrls', $_POST)) {
            $post_value = $_POST['otherPictureFileUrls'];
            update_post_meta($post->ID, 'otherPictureFileUrls', $post_value);
        }
        
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
        if( wp_next_scheduled( 'sa_cron_perform_sync' ) ){
            wp_clear_scheduled_hook( 'sa_cron_perform_sync' );
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
            'stateSince',
            'dateOfLeave',
            'dateOfDeath',
            'status',
            'internalNotes',
            'donationCall',
            'successStory',
            'privateAdoption',
        ], $animalSchema, $schema, $required);

        $this->get_custom_input_group('Medizinisches', 40, [
            'castrated',
            'bloodType',
        ], $animalSchema, $schema, $required);

        $this->get_custom_input_group('Zusätzliches', 50, [
            'notes',
            'supporters',
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
                $filedAsArea = array('notes', 'description', 'internalNotes', 'supporters');
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
    'stateSince' => 'Status seit',
    'dateOfLeave' => 'Abgabedatum',
    'dateOfDeath' => 'Todesdatum',
    'status' => 'Status',
    'notes' => 'Hinweise',
    'internalNotes' => 'Interne Notizen',
    'donationCall' => 'Spendenaufruf',
    'successStory' => 'Erfolgsgeschichte',
    'privateAdoption' => 'Fremdvermittlung',
    'castrated' => 'Kastriert',
    'bloodType' => 'Blutgruppe',
    'supporters' => 'Unterstützer'
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
});


global $SHELTERAPP_GLOBAL_ANIMAL;
$SHELTERAPP_GLOBAL_ANIMAL = new ShelterappAnimals();
