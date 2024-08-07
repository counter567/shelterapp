<?php
/**
 * UserRole
 *
 * PHP version 7.4
 *
 * @category Class
 * @package  OpenAPI\Client
 * @author   OpenAPI Generator team
 * @link     https://openapi-generator.tech
 */

/**
 * shelterapp-backend API
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * Generated by: https://openapi-generator.tech
 * Generator version: 7.7.0
 */

/**
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

namespace OpenAPI\Client\Model;
use \OpenAPI\Client\ObjectSerializer;

/**
 * UserRole Class Doc Comment
 *
 * @category Class
 * @package  OpenAPI\Client
 * @author   OpenAPI Generator team
 * @link     https://openapi-generator.tech
 */
class UserRole
{
    /**
     * Possible values of this enum
     */
    public const USER = 'USER';

    public const CARETAKER = 'CARETAKER';

    public const ADMIN = 'ADMIN';

    public const SUPER_ADMIN = 'SUPER_ADMIN';

    public const SUPER_DUPER_ADMIN = 'SUPER_DUPER_ADMIN';

    /**
     * Gets allowable values of the enum
     * @return string[]
     */
    public static function getAllowableEnumValues()
    {
        return [
            self::USER,
            self::CARETAKER,
            self::ADMIN,
            self::SUPER_ADMIN,
            self::SUPER_DUPER_ADMIN
        ];
    }
}


