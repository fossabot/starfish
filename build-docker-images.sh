#!/bin/bash

for image in discord frontend game
do
    cd ./${image} && npm install && docker build . -t spacecrab.local/${image} && cd ..
done