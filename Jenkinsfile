pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                echo 'Checking Docker installation...'
                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                sh 'docker compose build --no-cache'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                echo 'Stopping old containers...'
                sh 'docker compose down || true'
            }
        }

        stage('Start Application') {
            steps {
                echo 'Starting Sports Registration application...'
                sh 'docker compose up -d'
            }
        }

        stage('Check Containers') {
            steps {
                echo 'Checking running containers...'
                sh 'docker compose ps'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking application health...'
                sh '''
                    sleep 15
                    curl -f http://localhost/api/health
                '''
            }
        }
    }

    post {

        success {
            echo '========================================='
            echo 'Sports Registration Build Successful!'
            echo 'Application deployed successfully.'
            echo '========================================='
        }

        failure {
            echo '========================================='
            echo 'Sports Registration Build Failed!'
            echo 'Check the Jenkins console output.'
            echo '========================================='
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
