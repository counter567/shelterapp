#!/bin/sh

cd ./src/main/resources
if [ ! -f ./privateKey.pem ]
then
    openssl genrsa -out private-key.pem 4096;
    openssl rsa -pubout -in private-key.pem -out publicKey.pem;
    openssl pkcs8 -topk8 -nocrypt -inform pem -in private-key.pem -outform pem -out privateKey.pem;
    rm private-key.pem;
fi
