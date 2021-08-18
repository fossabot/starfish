
#!/bin/bash

image_prefix='xmadsen/starfish'
VERSION=latest
BUILD=1
PUSH=0
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -v|--version)
      VERSION="$2"
      shift # past argument
      shift # past value
      ;;
    --build)
      BUILD="$2"
      shift # past argument
      shift # past value
      ;;
    --push)
      PUSH="$2"
      shift # past argument
      shift # past value
      ;;
    *)    # unknown option
      POSITIONAL+=("$1") # save it in an array for later
      shift # past argument
      ;;
  esac
done

set -- "${POSITIONAL[@]}" # restore positional parameters

# # if ?$BUILD
# # then
for image in discord frontend game db nginx
do
    cp -r common ${image}/
    cp -r @types ${image}/
    docker build . -t ${image_prefix}-${image}:prod-${VERSION} --file=${image}/Dockerfile-prod
    rm -rf ${image}/common
    rm -rf ${image}/@types
done
# # fi

# if "${PUSH}" = "1"; then
for image in frontend game discord db nginx; do
docker image push ${image_prefix}-${image}:prod-${VERSION}
done
# fi