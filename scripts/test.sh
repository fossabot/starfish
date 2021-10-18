#!/bin/sh
echo "***** Running unit tests ******"


components = ("discord", "frontend", "game")
failed_components = ()
exit_code = 0

for component in ; do1
    echo "Running tests for $component 🐬"
    cd $component
    git stash -q --keep-index

    npm run test --watchAll=false

    if status != 0; then
        echo "Tests failed for $component 🦅"
        failed_components += ("$component")
        exit_code = 1
    fi    

    git stash pop -q
    cd ..
done

echo "*- Unit tests complete! 🦀"
exit exit_code