pipeline {
    agent any

    environment {
        // --- CONFIGURATION ---
        DOCKER_HUB_CRED_ID = 'docker-cred'   // ID of Docker Hub credentials stored in Jenkins
        DOCKER_USER        = 'thesanketpawar' // Change to your actual Docker Hub username
        
        // NodePort backend address accessible by public browsers
        BACKEND_PUBLIC_URL = 'http://13.235.94.86:30090' 
        
        // K8s Namespace
        K8S_NAMESPACE      = 'uber'

        // Image Tags
        FRONTEND_IMAGE     = "${DOCKER_USER}/uber-frontend:latest"
        BACKEND_IMAGE      = "${DOCKER_USER}/uber-backend:latest"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo "Fetching latest source code..."
                checkout scm
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "Building Backend Docker Image..."
                            dir('backend') {
                                sh "docker build -t ${BACKEND_IMAGE} ."
                            }
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        script {
                            echo "Building Frontend Docker Image with VITE_BASE_URL=${BACKEND_PUBLIC_URL}..."
                            dir('frontend') {
                                // CRITICAL: Pass build argument into Vite static build stage
                                sh "docker build --build-arg VITE_BASE_URL=${BACKEND_PUBLIC_URL} -t ${FRONTEND_IMAGE} ."
                            }
                        }
                    }
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    echo "Logging into Docker Hub and pushing images..."
                    withCredentials([usernamePassword(credentialsId: DOCKER_HUB_CRED_ID, usernameVariable: 'DOCKER_USER_VAR', passwordVariable: 'DOCKER_PASS_VAR')]) {
                        sh "echo \$DOCKER_PASS_VAR | docker login -u \$DOCKER_USER_VAR --password-stdin"
                        sh "docker push ${BACKEND_IMAGE}"
                        sh "docker push ${FRONTEND_IMAGE}"
                    }
                }
            }
        }

        stage('Deploy & Rollout to Kubernetes') {
            steps {
                script {
                    echo "Applying Kubernetes manifests and restarting deployments in namespace: ${K8S_NAMESPACE}..."
                    
                    // Apply manifests if located in k8s/ directory
                    sh "kubectl apply -f k8s/ -n ${K8S_NAMESPACE}"

                    // Trigger zero-downtime rolling update
                    sh "kubectl rollout restart deployment/backend -n ${K8S_NAMESPACE}"
                    sh "kubectl rollout restart deployment/frontend -n ${K8S_NAMESPACE}"

                    // Verify rollout status
                    sh "kubectl rollout status deployment/backend -n ${K8S_NAMESPACE} --timeout=120s"
                    sh "kubectl rollout status deployment/frontend -n ${K8S_NAMESPACE} --timeout=120s"
                }
            }
        }
    }

    post {
        success {
            echo "Successfully built and deployed Uber Clone to Kubernetes!"
            echo "Frontend accessible at: http://13.235.94.86:30080"
            echo "Backend accessible at:  http://13.235.94.86:30090"
        }
        failure {
            echo "Pipeline failed! Checking Kubernetes pod status..."
            sh "kubectl get pods -n ${K8S_NAMESPACE}"
            sh "kubectl logs deployment/frontend -n ${K8S_NAMESPACE} --tail=50 || true"
            sh "kubectl logs deployment/backend -n ${K8S_NAMESPACE} --tail=50 || true"
        }
        always {
            echo "Cleaning up local Docker dangling images..."
            sh "docker image prune -f || true"
        }
    }
}
