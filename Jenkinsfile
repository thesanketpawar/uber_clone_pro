pipeline {
    agent any

    environment {
        // Change these variables to match your details
        DOCKER_USER     = 'thesanketpawar'
        IMAGE_NAME      = 'uber_clone_pro'
        IMAGE_TAG       = "${BUILD_NUMBER}" // Uses Jenkins build number as tag
        DOCKER_CREDS    = 'docker-credentials' // The ID created in Step 2
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/thesanketpawar/uber_clone_pro.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker build -t ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_USER}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh "echo $PASS | docker login -u $USER --password-stdin"
                        sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "Deploying to Kubernetes..."
                    // Update your deployment file with the new image tag or apply manifests
                    sh "kubectl set image deployment/your-deployment-name your-container-name=${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                    // OR if applying manifest files stored in your repo:
                    // sh "kubectl apply -f k8s/"
                }
            }
        }
    }

    post {
        always {
            // Clean up images locally to save disk space on EC2
            sh "docker rmi ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} || true"
        }
    }
}
