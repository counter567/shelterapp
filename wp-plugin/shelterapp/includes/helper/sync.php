<?php

global $sa_sync_config;
$sa_sync_config = array(
    'ignoredAutoMapping' => ['id', 'name', 'type', 'allergies', 'illnesses', 'otherPictureFileUrls', 'mainPictureFileUrl'],
    'allFields' =>["id", "name", "date_of_birth", "date_of_admission", "type", "breed_one", "breed_two", "sex", "color", "main_picture_file_url", "other_picture_file_urls", "weight", "height_at_withers", "circumference_of_neck", "length_of_back", "circumference_of_chest", "castrated", "blood_type", "illnesses", "allergies", "chip_number", "public", "status", "was_found", "success_story", "missing", "private_adoption", "notes", "description", "donation_call", "internal_notes", "date_of_leave", "date_of_death", "created_at", "updated_at", "notices", "supporters"],
    'attributeMap' => array_flip(OpenAPI\Client\Model\Animal::attributeMap()),
    'setters' => OpenAPI\Client\Model\Animal::setters(),
);




function sa_sync_delete_animal(string $id){
    global $sa_sync_config;
    $client = sa_get_animal_resource_client();
    $client->animalsDelete($id);
}

function sa_sync_sync_animals(){
    global $sa_sync_config;
    $client = sa_get_animal_resource_client();
        if (!$client) {
            outLog('Could not get client, no token or token expired.');
            return;
        }

        /** @var \OpenAPI\Client\Model\Animal[] */
        $animals = array();
        sa_sync_getAllAnimalsFromDate($client, $animals);

        $options = sa_get_config();
        $i = 0;

        if (isset($animals) && is_array($animals) && !empty($animals)) {
            outLog('updating animals from shelterapp backend: ' . count($animals));
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
                /** @var array<WP_Post> */
                $posts = get_posts($args);

                require_once ABSPATH . 'wp-admin/includes/media.php';

                if (count($posts) > 0) {
                    // we already have a post with this link id!
                    sa_sync_update_animal($animal, $posts[0], $i);
                } else {
                    sa_sync_insert_animal($animal, $i);
                }

                if($i >= $options['shelterapp_persync']) {
                    outLog('Max '.$options['shelterapp_persync'].' animals per sync reached.');
                    return;
                }
            }
        }

        $args = array(
            'post_type' => 'shelterapp_animals',
            'post_status' => 'any',
            'posts_per_page' => -1,
            'meta_query' => array(
                'relation' => 'OR', //default AND
                array(
                    'key' => 'shelterapp_id',
                    'compare' => 'NOT EXISTS'
                ),
                array(
                    'key' => 'shelterapp_id',
                    'value' => '_wp_zero_value',
                    'compare' => '='
                )
            )
        );
        /** @var array<WP_Post> */
        $posts = get_posts($args);
        outLog('Check for orphaned animals ' . count($posts));
        
        foreach ($posts as $post) {
            // send animal to backend
            $animal = sa_sync_map_post_to_animal($post);
            try{
                $result = $client->animalsPost($animal);
                if(isset($result) && !empty($result))
                $shelterappID = $result->getId();
                update_post_meta($post->ID, 'shelterapp_id', $shelterappID);
            } catch (Exception $e) {
                outLog('Error while sending animal to backend: ' . $e->getMessage());
            }
        }
}

function sa_sync_map_post_to_animal(WP_Post $post){
    global $sa_sync_config;
    $attributeMap = $sa_sync_config['attributeMap'];
    $setters = $sa_sync_config['setters'];

    $animal = new OpenAPI\Client\Model\Animal();

    $shelterappId = get_post_meta($post->ID, 'shelterapp_id', true);
    if(isset($shelterappId) && !empty($shelterappId)){
        $animal->setId($shelterappId);
    }
    $animal->setName($post->post_title);
    outLog(get_the_terms($post->ID, 'shelterapp_animal_type'));

    $type = get_the_terms($post->ID, 'shelterapp_animal_type');
    if(isset($type) && is_array($type) && count($type) > 0) {
        $animal->setType($type[0]->name);
    }

    $allergies = get_the_terms($post->ID, 'shelterapp_animal_allergies');
        if(isset($type) && is_array($type) && count($type) > 0) {
        $animal->setAllergies(array_map(function ($term) {
            return $term->name;
        }, $allergies ? $allergies : array()));
    }

    $illnesses = get_the_terms($post->ID, 'shelterapp_animal_illness');
        if(isset($type) && is_array($type) && count($type) > 0) {
        $animal->setIllnesses(array_map(function ($term) {
            return $term->name;
        }, $illnesses ? $illnesses : array()));
    }

    $animal->setPublic($post->post_status === 'publish');
    
    $fields = get_fields($post->ID);
    foreach ($fields as $key => $value) {
        if (in_array($key, $sa_sync_config['ignoredAutoMapping']) || str_starts_with($key, '_')) {
            continue;
        }
        $method = $setters[$attributeMap[$key]];
        $animal->$method($value);
    }

    // get feature image and set as main_picture_file_url
    $thumbnail = get_the_post_thumbnail_url($post->ID);
    if ($thumbnail) {
        $animal->setMainPictureFileUrl($thumbnail);
    }
    // get otherPictureFileUrls and set as other_picture_file_urls
    $otherImages = array();
    $images = get_post_meta($post->ID, 'otherPictureFileUrls', true);
    outLog($images);
    if (isset($images) && is_array($images) && count($images) > 0) {
        foreach ($images as $image) {
            array_push($otherImages, wp_get_attachment_image_url($image, 'full'));
        }
    }
    $animal->setOtherPictureFileUrls($otherImages);

    outLog($animal);
    return $animal;
}


function sa_sync_getAllAnimalsFromDate(OpenAPI\Client\Api\AnimalResourceApi $client, array &$allAnimals, int $chunksize = 50, int $page = 0)
{
    $options = sa_get_config();
    if(isDebug()){
        unset($options['shelterapp_sync_from']);
    }

    // if (isset($options['shelterapp_sync_from'])) {
    //     // get all updates from date.
    //     $date = SaDateTime::createFromFormat('U', $options['shelterapp_sync_from']);
    //     $date->setTimezone(new DateTimeZone("UTC"));
    //     error_log('Update animals from date: ' . $date->format('Y-m-d\\TH:i:s'));

    //     // update shelterapp_sync_from
    //     $date2 = new DateTime('now', new DateTimeZone("UTC"));
    //     $options['shelterapp_sync_from'] = $date2->getTimestamp();
    //     sa_set_config($options);

    //     return sa_sync_doGetAllAnimalsFromDate($client, $date, $allAnimals, $chunksize, $page);
    // } else {
        // init with all animals
        error_log('Get all animals.');

        // update shelterapp_sync_from
        $date = new DateTime('now', new DateTimeZone("UTC"));
        $options['shelterapp_sync_from'] = $date->getTimestamp();
        sa_set_config($options);

        return sa_sync_doGetAllAnimalsFromDate($client, null, $allAnimals, $chunksize, $page);
    // }
}

function sa_sync_doGetAllAnimalsFromDate(OpenAPI\Client\Api\AnimalResourceApi $client, DateTime $date = null, array &$allAnimals, int $chunksize = 50, int $page = 0)
{
    if ($page > 1000) {
        throw new \Exception('To many pages');
    }
    try{
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
    } catch (Exception $e) {
        error_log('Error while fetching animals: ' . $e->getMessage());
        return;
    }
    sa_sync_doGetAllAnimalsFromDate($client, $date, $allAnimals, $chunksize, $page + 1);
}

function sa_sync_ensure_term(string $type)
{
    $term = get_term_by('slug', sanitize_title($type), 'shelterapp_animal_type');
    if (!isset($term) || !$term || is_wp_error($term)) {
        wp_insert_term($type, 'shelterapp_animal_type');
    }
}

function sa_sync_ensure_illnesses(array $illnesses)
{
    foreach ($illnesses as $illness) {
        $term = get_term_by('slug', sanitize_title($illness), 'shelterapp_animal_illness');
        if (!isset($term) || !$term || is_wp_error($term)) {
            wp_insert_term($illness, 'shelterapp_animal_illness');
        }
    }
}

function sa_sync_ensure_allergies(array $allergies)
{
    foreach ($allergies as $allergy) {
        $term = get_term_by('slug', sanitize_title($allergy), 'shelterapp_animal_allergies');
        if (!isset($term) || !$term || is_wp_error($term)) {
            wp_insert_term($allergy, 'shelterapp_animal_allergies');
        }
    }
}

/**
 * @param OpenAPI\Client\Model\Animal $animal 
 */
function sa_sync_insert_animal($animal, &$i)
{
    outLog('*****************************************');
    outLog('Insert ' . $animal->getName() . ' ' . $animal->getId() . ' ' . ($animal->getUpdatedAt() !== null ? $animal->getUpdatedAt()->format('Y-m-d H:i:s') : 'no date'));
    global $sa_sync_config;

    $i++;
    global $importedAnimals;
    $importedAnimals++;
    
    $post = array(
        'post_title' => $animal->getName(),
        'post_status' => $animal->getPublic() ? 'publish' : 'draft',
        'post_type' => 'shelterapp_animals',
        'meta_input' => array(
            'shelterapp_id' => $animal->getId(),
        )
    );
    $serialize = $animal->jsonSerialize();
    foreach ($serialize as $key => $value) {
        if (in_array($key, $sa_sync_config['ignoredAutoMapping'])) {
            continue;
        }
        $post['meta_input'][$key] = $value;
    }

    $id = wp_insert_post($post);
    if (is_wp_error($id)) {
        return;
    }
    $post = get_post($id);
    try{
        sa_sync_set_taxonomies($id, $animal);
        sa_sync_update_post_feature_image($post, $animal);
        sa_sync_update_post_other_images($post, $animal);
    } catch (Exception $e) {
        outLog('Error while inserving Animal: ' . $e->getMessage());
        // wp_delete_post($id, true);
    }
}

/**
 * @param OpenAPI\Client\Model\Animal $animal
 */
function sa_sync_set_taxonomies(int $id, $animal)
{
    $typeTerm = get_term_by('slug', sanitize_title($animal->getType()), 'shelterapp_animal_type')->term_id;
    wp_set_post_terms($id, $typeTerm, 'shelterapp_animal_type');

    $allergyTerms = [];
    foreach ($animal->getAllergies() as $allergy) {
        $allergyTerms[] = get_term_by('slug', sanitize_title($allergy), 'shelterapp_animal_allergies')->term_id;
    }
    wp_set_post_terms($id, $allergyTerms, 'shelterapp_animal_allergies');

    $illnessTerms = [];
    foreach ($animal->getIllnesses() as $illness) {
        $illnessTerms[] = get_term_by('slug', sanitize_title($illness), 'shelterapp_animal_illness')->term_id;
    }
    wp_set_post_terms($id, $illnessTerms, 'shelterapp_animal_illness');
}

/**
 * @param OpenAPI\Client\Model\Animal $animal 
 * @param WP_Post $post
 */
function sa_sync_update_animal($animal, $post, &$i)
{
    // if the animal is updated AFTER the last WP update, we update the WP post
    $postModified = new DateTime($post->post_modified);
    $postModified->setTimezone(new DateTimeZone("UTC"));

    if ($animal->getUpdatedAt() < $postModified) {
        return;
    }
    
    outLog('*****************************************');
    outLog('Update ' . $animal->getName() . ' ' . $animal->getId() . ' ' . ($animal->getUpdatedAt() !== null ? $animal->getUpdatedAt()->format('Y-m-d H:i:s') : 'no date'));
    
    $i++;
    global $importedAnimals;
    $importedAnimals++;

    outLog('Update animal.');
    global $sa_sync_config;
    $update = array(
        'ID' => $post->ID,
        'post_title' => $animal->getName(),
        'post_status' => $animal->getPublic() ? 'publish' : 'draft',
    );

    $serialize = $animal->jsonSerialize();
    foreach ($serialize as $key => $value) {
        if (in_array($key, $sa_sync_config['ignoredAutoMapping'])) {
            continue;
        }
        $update['meta_input'][$key] = $value;
    }

    wp_update_post($update);
    sa_sync_set_taxonomies($post->ID, $animal);
    sa_sync_update_post_feature_image($post, $animal);
    sa_sync_update_post_other_images($post, $animal);
}

/**
 * @param WP_Post $post
 * @param OpenAPI\Client\Model\Animal $animal
 */
function sa_sync_update_post_feature_image($post, $animal){
    // get current feature image attachment source if available
    $source = null;
    $attachmentID = get_post_thumbnail_id($post->ID);
    if($attachmentID){
        $attachment = get_post($attachmentID);
        // get external source
        $source = get_post_meta($attachment->ID, 'shelterapp_source', true);
    }

    if ($source !== $animal->getMainPictureFileUrl()) {
        outLog('update feature image');
        // add new thunbnail to post as feature image
        // check if the file already exists
        $attach_id = attachment_url_to_postid($animal->getMainPictureFileUrl());
        if ($attach_id) {
            // and attach it
            set_post_thumbnail($post->ID, $attach_id);
        } else {
            // upload file to media library and set as thunbnail
            $upload_dir = wp_upload_dir();
            $image_data = file_get_contents($animal->getMainPictureFileUrl());
            if($image_data === false) {
                return outLog('Could not download image: ' . $animal->getMainPictureFileUrl());
            }
            $filename = basename($animal->getMainPictureFileUrl());
            if (wp_mkdir_p($upload_dir['path'])) {
                $file = $upload_dir['path'] . '/' . $filename;
            } else {
                $file = $upload_dir['basedir'] . '/' . $filename;
            }
            file_put_contents($file, $image_data);
            $wp_filetype = wp_check_filetype($filename, null);
            // create attachment
            $attachment = array(
                'post_mime_type' => $wp_filetype['type'],
                'post_title' => sanitize_file_name($filename),
                'post_content' => '',
                'post_status' => 'inherit'
            );
            $attach_id = wp_insert_attachment($attachment, $file, $post->ID);
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            $attach_data = wp_generate_attachment_metadata($attach_id, $file);
            wp_update_attachment_metadata($attach_id, $attach_data);
            // set source to attachment
            update_post_meta($attach_id, 'shelterapp_source', $animal->getMainPictureFileUrl());
            set_post_thumbnail($post->ID, $attach_id);
            
            // delte old attachment
            if($attachmentID){
                wp_delete_attachment($attachmentID, true);
            }
        }
    }
}

/**
 * @param WP_Post $post
 * @param OpenAPI\Client\Model\Animal $animal
 */
function sa_sync_update_post_other_images($post, $animal){
    // save other_picture_file_urls as post meta otherPictureFileUrls
    $otherImagesSources = array();
    $otherImagesIds = array();
    $images = get_post_meta($post->ID, 'otherPictureFileUrls', true);
    
    if (isset($images) && is_array($images) && count($images) > 0) {
        foreach ($images as $image) {
            $attachment = get_post($image);
            $source = get_post_meta($attachment->ID, 'shelterapp_source', true);
            if(!$source){
                $source = wp_get_attachment_image_url($image, 'full');
            }
            array_push($otherImagesSources, $source);
            array_push($otherImagesIds, $image);
        }
    }

    // check if other images are the same order independent
    $newOtherImages = $animal->getOtherPictureFileUrls();
    
    sort($otherImagesSources);
    sort($newOtherImages);
    if($otherImagesSources !== $newOtherImages){
        outLog('update other images');
        $otherImagesIds = array();
        foreach ($newOtherImages as $image) {
            // check if url is inside $otherImagesSources list
            $found = array_search($image, $otherImagesSources, true);
            if($found !== false){
                outLog('found image in list, skip upload');
                array_push($otherImagesIds, $otherImagesIds[$found]);
                continue;
            }

            // try to find attachment
            $attach_id = attachment_url_to_postid($image);
            if ($attach_id) {
                array_push($otherImagesIds, $attach_id);
            } else {
                // upload file to media library and set as thunbnail
                $upload_dir = wp_upload_dir();
                $image_data = file_get_contents($image);
                if($image_data === false) {
                    return outLog('Could not download image: ' . $image);
                }
                $filename = basename($image);
                if (wp_mkdir_p($upload_dir['path'])) {
                    $file = $upload_dir['path'] . '/' . $filename;
                } else {
                    $file = $upload_dir['basedir'] . '/' . $filename;
                }
                file_put_contents($file, $image_data);
                $wp_filetype = wp_check_filetype($filename, null);
                $attachment = array(
                    'post_mime_type' => $wp_filetype['type'],
                    'post_title' => sanitize_file_name($filename),
                    'post_content' => '',
                    'post_status' => 'inherit'
                );
                $attach_id = wp_insert_attachment($attachment, $file, $post->ID);
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                $attach_data = wp_generate_attachment_metadata($attach_id, $file);
                wp_update_attachment_metadata($attach_id, $attach_data);
                update_post_meta($attach_id, 'shelterapp_source', $image);
                array_push($otherImagesIds, $attach_id);
            }
        }
        update_post_meta($post->ID, 'otherPictureFileUrls', $otherImagesIds);
    } else {
        outLog('no changes in other images');
    }
    
}


