image_prefix='xmadsen/starfish'
for image in frontend game discord
do
    docker image push ${image_prefix}-${image}:prod-latest
done