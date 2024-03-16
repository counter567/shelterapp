#!/bin/sh

if ! command -v openapi-generator-cli &> /dev/null
then
    mkdir -p ~/bin/openapitools
    curl https://raw.githubusercontent.com/OpenAPITools/openapi-generator/master/bin/utils/openapi-generator-cli.sh > ~/bin/openapitools/openapi-generator-cli
    chmod u+x ~/bin/openapitools/openapi-generator-cli
    export PATH=$PATH:~/bin/openapitools/
fi



openapi-generator-cli generate -i ./backend/docs/openapi/openapi.yaml -g php -o ./tools/.generate/php/ --skip-validate-spec
openapi-generator-cli generate -i ./backend/docs/openapi/openapi.yaml -g typescript-fetch -o ./tools/.generate/ts/ --skip-validate-spec

cd ./tools/.generate/php/;

php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === 'dac665fdc30fdd8ec78b38b9800061b4150413ff2e3b6f88543c636f7cd84f6db9189d43a81e5503cda447da73c7e5b6') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
php composer.phar install
php -r "unlink('composer.phar');"

cd -
cp -r ./tools/.generate/php/vendor ./wp-plugin/shelterapp/
cp -r ./tools/.generate/php/lib ./wp-plugin/shelterapp/