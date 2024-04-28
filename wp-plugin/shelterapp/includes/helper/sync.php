<?php


function sa_sync_ensure_term(string $type)
{
    $term = get_term_by('name', $type, 'shelterapp_animal_type');
    if (!isset($term) || !$term || is_wp_error($term)) {
        wp_insert_term($type, 'shelterapp_animal_type');
    }
}

function sa_sync_ensure_illnesses(array $illnesses)
{
    foreach ($illnesses as $illness) {
        $term = get_term_by('name', $illness, 'shelterapp_animal_illness');
        if (!isset($term) || !$term || is_wp_error($term)) {
            wp_insert_term($illness, 'shelterapp_animal_illness');
        }
    }
}

function sa_sync_ensure_allergies(array $allergies)
{
    foreach ($allergies as $allergy) {
        $term = get_term_by('name', $allergy, 'shelterapp_animal_allergies');
        if (!isset($term) || !$term || is_wp_error($term)) {
            wp_insert_term($allergy, 'shelterapp_animal_allergies');
        }
    }
}


/**
 * @param OpenAPI\Client\Model\Animal $animal 
 */
function sa_sync_insert_animal($animal)
{
    $term = get_term_by('name', $animal->getType(), 'shelterapp_animal_type');
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
        if (in_array($key, ['id', 'name', 'type', 'isCastrated', 'allergies', 'illnesses', 'sex', 'otherPictureFileUrls'])) {
            continue;
        }
        $post['meta_input'][$key] = $value;
    }

    $id = wp_insert_post($post);
    if (is_wp_error($id)) {
        return;
    }
    sa_sync_set_taxonomies($id, $animal);
}

/**
 * @param OpenAPI\Client\Model\Animal $animal
 */
function sa_sync_set_taxonomies(int $id, $animal)
{
    $typeTerm = get_term_by('name', $animal->getType(), 'shelterapp_animal_type')->term_id;
    wp_set_post_terms($id, $typeTerm, 'shelterapp_animal_type');

    $allergyTerms = [];
    foreach ($animal->getAllergies() as $allergy) {
        $allergyTerms[] = get_term_by('name', $allergy, 'shelterapp_animal_allergies')->term_id;
    }
    wp_set_post_terms($id, $allergyTerms, 'shelterapp_animal_allergies');

    $illnessTerms = [];
    foreach ($animal->getIllnesses() as $illness) {
        $illnessTerms[] = get_term_by('name', $illness, 'shelterapp_animal_illness')->term_id;
    }
    wp_set_post_terms($id, $illnessTerms, 'shelterapp_animal_illness');
}

/**
 * @param OpenAPI\Client\Model\Animal $animal 
 * @param WP_Post $post
 */
function sa_sync_update_animal($animal, $post)
{
    $update = array(
        'ID' => $post->ID,
        'post_title' => $animal->getName(),
        'post_status' => $animal->getPublic() ? 'publish' : 'draft',
    );

    $serialize = $animal->jsonSerialize();
    foreach ($serialize as $key => $value) {
        if (in_array($key, ['id', 'name', 'type', 'isCastrated', 'allergies', 'illnesses', 'sex', 'otherPictureFileUrls'])) {
            continue;
        }
        $update['meta_input'][$key] = $value;
    }
    wp_update_post($update);
    sa_sync_set_taxonomies($post->ID, $animal);
}

