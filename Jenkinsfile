pipeline {

    agent any

    environment {

        AWS_REGION = 'us-east-1'

        AWS_ACCOUNT_ID = '223436695813'

        ECR_REGISTRY =
            "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        FRONTEND_IMAGE =
            "${ECR_REGISTRY}/sports-registrations-frontend"

        BACKEND_IMAGE =
            "${ECR_REGISTRY}/sports-registrations-backend"

        APP_SERVER =
            'ubuntu@3.216.123.216'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        stage('Backend Test') {
            steps {
                sh '''
                    set -e

                    cd backend

                    npm install

                    npm test
                '''
            }
        }


        stage('Frontend Test') {
            steps {
                sh '''
                    set -e

                    cd frontend

                    npm install

                    npm test

                    npm run build
                '''
            }
        }


        stage('Docker Build') {
            steps {
                sh '''
                    set -e

                    docker build \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend

                    docker build \
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                '''
            }
        }


        stage('ECR Login') {
            steps {
                sh '''
                    set -e

                    aws ecr get-login-password \
                        --region ${AWS_REGION} \
                    | docker login \
                        --username AWS \
                        --password-stdin \
                        ${ECR_REGISTRY}
                '''
            }
        }


        stage('Push Images') {
            steps {
                sh '''
                    set -e

                    docker push \
                        ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                    docker push \
                        ${FRONTEND_IMAGE}:latest

                    docker push \
                        ${BACKEND_IMAGE}:${BUILD_NUMBER}

                    docker push \
                        ${BACKEND_IMAGE}:latest
                '''
            }
        }


        stage('Deploy Application') {
            steps {
                sh '''
                    set -e

                    ssh \
                        -o StrictHostKeyChecking=no \
                        ${APP_SERVER} \
                    '
                        cd ~/sports-registrations

                        docker compose pull

                        docker compose up -d

                        docker image prune -f
                    '
                '''
            }
        }


        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e

                    ssh \
                        -o StrictHostKeyChecking=no \
                        ${APP_SERVER} \
                    '
                        curl -f http://localhost/api/health
                    '
                '''
            }
        }
    }


    post {

        success {
            echo "Sports Registrations deployed successfully."
        }

        failure {
            echo "Sports Registrations deployment failed."
        }

        always {
            sh '''
                docker logout ${ECR_REGISTRY} || true
            '''
        }
    }
}
