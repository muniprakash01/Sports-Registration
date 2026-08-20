pipeline {

    agent any

    environment {
        COMPOSE_PROJECT_NAME = "sports-registrations"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    set -e

                    echo "Checking Docker..."
                    docker --version

                    echo "Checking Docker Compose..."
                    docker compose version

                    echo "Checking project files..."
                    test -f docker-compose.yml
                    test -f backend/Dockerfile
                    test -f backend/package.json
                    test -f backend/server.js
                    test -f frontend/Dockerfile
                    test -f frontend/index.html
                    test -f nginx/default.conf
                    test -f database/init.sql

                    echo "All required files are present."
                '''
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh '''
                    set -e

                    echo "Validating Docker Compose configuration..."

                    docker compose config > /dev/null

                    echo "Docker Compose configuration is valid."
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    set -e

                    echo "Building backend Docker image..."

                    docker build \
                        -t sports-backend:${BUILD_NUMBER} \
                        ./backend
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    set -e

                    echo "Building frontend Docker image..."

                    docker build \
                        -t sports-frontend:${BUILD_NUMBER} \
                        -f frontend/Dockerfile \
                        .
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                    set -e

                    echo "Deploying Sports Registrations application..."

                    docker compose up -d --build

                    echo "Waiting for services..."

                    sleep 15

                    echo "Docker containers:"
                    docker compose ps
                '''
            }
        }

        stage('Application Health Check') {
            steps {
                sh '''
                    set -e

                    echo "Checking application health..."

                    for i in 1 2 3 4 5 6 7 8 9 10
                    do
                        echo "Health check attempt $i..."

                        if curl -f http://localhost/api/health; then
                            echo ""
                            echo "Application is healthy."
                            exit 0
                        fi

                        echo "Application is not ready yet..."
                        sleep 5
                    done

                    echo "Application health check failed."

                    docker compose logs

                    exit 1
                '''
            }
        }

        stage('API Test') {
            steps {
                sh '''
                    set -e

                    echo "Testing GET /api/registrations..."

                    curl -f http://localhost/api/registrations

                    echo ""
                    echo "API test successful."
                '''
            }
        }

        stage('Show Deployment Status') {
            steps {
                sh '''
                    echo "=========================================="
                    echo "SPORTS REGISTRATIONS DEPLOYMENT"
                    echo "=========================================="

                    docker compose ps

                    echo ""
                    echo "Application URL:"
                    echo "http://$(hostname -I | awk '{print $1}')"

                    echo ""
                    echo "Health URL:"
                    echo "http://$(hostname -I | awk '{print $1}')/api/health"

                    echo "=========================================="
                '''
            }
        }
    }

    post {

        success {
            echo '''
            ==========================================
            BUILD SUCCESSFUL
            Sports Registrations is running.
            ==========================================
            '''
        }

        failure {
            echo '''
            ==========================================
            BUILD FAILED
            Check the Jenkins console output.
            ==========================================
            '''

            sh '''
                docker compose ps || true
                docker compose logs --tail=100 || true
            '''
        }

        always {
            echo 'Jenkins pipeline completed.'
        }
    }
}
