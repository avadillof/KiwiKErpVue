pipeline {

    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        IMAGE_NAME = 'kiwikerp-frontend-standard'
        FRONTEND_VERSION = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${IMAGE_NAME}:${FRONTEND_VERSION} \
                      .
                '''
            }
        }

        stage('Verify Image') {
            steps {
                sh '''
                    docker images ${IMAGE_NAME}:${FRONTEND_VERSION}
                '''
            }
        }
    }

    post {

        success {
            echo "Frontend STANDARD construido correctamente."
            echo "Imagen: ${IMAGE_NAME}:${FRONTEND_VERSION}"
        }

        failure {
            echo "La construcción del Frontend STANDARD ha fallado."
        }
    }
}