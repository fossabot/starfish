node {
    def game

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */

        checkout scm
    }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */

        game = docker.build("xmadsen/starfish-game", "-f game/Dockerfile-prod .")
        db = docker.build("xmadsen/starfish-db", "-f db/Dockerfile-prod .")
        frontend = docker.build("xmadsen/starfish-frontend", "-f frontend/Dockerfile-prod .")
        discord = docker.build("xmadsen/starfish-discord", "-f discord/Dockerfile-prod .")
        nginx = docker.build("xmadsen/starfish-nginx", "-f nginx/Dockerfile-prod .")
    }

    // stage('Test image') {
    //     /* Ideally, we would run a test framework against our image.
    //      * For this example, we're using a Volkswagen-type approach ;-) */

    //     app.inside {
    //         sh 'echo "Tests passed"'
    //     }
    // }

    stage('Push image') {
        /* Finally, we'll push the image with two tags:
         * First, the incremental build number from Jenkins
         * Second, the 'latest' tag.
         * Pushing multiple tags is cheap, as all the layers are reused. */
        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            game.push("${env.BUILD_NUMBER}")
            game.push("latest")
            discord.push("${env.BUILD_NUMBER}")
            discord.push("latest")
            frontend.push("${env.BUILD_NUMBER}")
            frontend.push("latest")
            db.push("${env.BUILD_NUMBER}")
            db.push("latest")
            nginx.push("${env.BUILD_NUMBER}")
            nginx.push("latest")
        }
    }
}