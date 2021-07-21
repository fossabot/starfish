#!/bin/bash

image_prefix='xmadsen/starfish'
for image in discord frontend game
do
    cp -r common ${image}/
    cp -r @types ${image}/
    docker build ${image} -t ${image_prefix}-${image}:prod-latest --file=${image}/Dockerfile-prod
    rm -rf ${image}/common
    rm -rf ${image}/@types
done


