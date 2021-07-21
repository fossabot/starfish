#!/bin/bash

for image in discord frontend game
do
    cd ./${image} && npm install && docker build . -t xmadsen/starfish-${image}:latest && cd ..
done
