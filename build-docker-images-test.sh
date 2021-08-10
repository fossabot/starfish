#!/bin/bash

for image in discord frontend game
do
    cd ./${image} && npm install && docker build . -f ./Dockerfile -t xmadsen/starfish-${image}:0.1 && cd ..
done
