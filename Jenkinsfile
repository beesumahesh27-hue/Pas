pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --watchAll=false --passWithNoTests'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo 'Pipeline passed successfully!'
            githubNotify status: 'SUCCESS', description: 'Build passed', context: 'jenkins/pipeline'
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
            githubNotify status: 'FAILURE', description: 'Build failed', context: 'jenkins/pipeline'
        }
        aborted {
            githubNotify status: 'ERROR', description: 'Build aborted', context: 'jenkins/pipeline'
        }
    }
}
