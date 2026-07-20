pipeline {
    agent any

    environment {
        // Docker Hub Credentials & Image Names
        DOCKER_USER  = 'thesanketpawar'
        IMAGE_TAG    = "${BUILD_NUMBER}"
        DOCKER_CREDS = 'docker-cred' // Matches your Jenkins Credential ID
    }

    stages {
        stage('Build Docker Images') {
            steps {
                script {
                    echo "--- Building Backend Image ---"
                    sh "docker build -t ${DOCKER_USER}/uber-backend:${IMAGE_TAG} ./Backend"
                    sh "docker tag ${DOCKER_USER}/uber-backend:${IMAGE_TAG} ${DOCKER_USER}/uber-backend:latest"

                    echo "--- Building Frontend Image ---"
                    sh "docker build -t ${DOCKER_USER}/uber-frontend:${IMAGE_TAG} ./frontend"
                    sh "docker tag ${DOCKER_USER}/uber-frontend:${IMAGE_TAG} ${DOCKER_USER}/uber-frontend:latest"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    echo "--- Logging into Docker Hub ---"
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        // Single quotes around shell command prevent password exposure in build logs
                        sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
                        
                        echo "--- Pushing Backend Images ---"
                        sh "docker push ${DOCKER_USER}/uber-backend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_USER}/uber-backend:latest"

                        echo "--- Pushing Frontend Images ---"
                        sh "docker push ${DOCKER_USER}/uber-frontend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_USER}/uber-frontend:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "--- Deploying Manifests to Kubernetes ---"
                    // Applies all .yaml manifests stored in the k8s directory
                    sh "kubectl apply -f ./k8s/"
                }
            }
        }
    }

    post {
        always {
            script {
                echo "--- Cleaning up local Docker images ---"
                sh "docker rmi ${DOCKER_USER}/uber-backend:${IMAGE_TAG} ${DOCKER_USER}/uber-frontend:${IMAGE_TAG} || true"
            }
        }
        success {
            echo "CI/CD Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed. Please check the logs above."
        }
    }
}
