pipeline {
    agent any

    environment {
        DOCKER_USER  = 'thesanketpawar'
        IMAGE_TAG    = "${BUILD_NUMBER}"
        DOCKER_CREDS = 'docker-cred' // Match your Jenkins Credential ID
    }

    stages {
        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building Backend and Frontend images..."
                    sh "docker build -t ${DOCKER_USER}/uber-backend:${IMAGE_TAG} ./Backend"
                    sh "docker tag ${DOCKER_USER}/uber-backend:${IMAGE_TAG} ${DOCKER_USER}/uber-backend:latest"

                    sh "docker build -t ${DOCKER_USER}/uber-frontend:${IMAGE_TAG} ./frontend"
                    sh "docker tag ${DOCKER_USER}/uber-frontend:${IMAGE_TAG} ${DOCKER_USER}/uber-frontend:latest"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh "echo $PASS | docker login -u $USER --password-stdin"
                        
                        sh "docker push ${DOCKER_USER}/uber-backend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_USER}/uber-backend:latest"

                        sh "docker push ${DOCKER_USER}/uber-frontend:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_USER}/uber-frontend:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "Deploying manifests to Kubernetes..."
                    // Adjust path if your k8s manifest files are inside a specific folder like ./docker or ./k8s
                    sh "kubectl apply -f ./docker/"
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi ${DOCKER_USER}/uber-backend:${IMAGE_TAG} ${DOCKER_USER}/uber-frontend:${IMAGE_TAG} || true"
        }
    }
}
