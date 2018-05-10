pipeline {
    agent any

    stages {
        stage('Git') {
            steps {
                git branch: 'develop', credentialsId: '0dac0ada-b80e-4376-849e-e952dbd1b4bb', url: 'https://release@sourcecode.ana.corp.aviva.com/scm/dig/gi-voice-services.git'
            }
        }

        stage('build') {
            steps {
                tool name: 'nodejs-8.2.0', type: 'nodejs'

                sh '''#Set proxy
                #http_proxy=\'http://cahoproxy.ca.cgugroup:3128\' ; export http_proxy
                #https_proxy=\'http://cahoproxy.ca.cgugroup:3128\' ; export https_proxy

                #npm config set proxy http://cahoproxy.ca.cgugroup:3128
                #npm config set https-proxy http://cahoproxy.ca.cgugroup:3128

                # Build fails if node_modules directory is present in workspace
                if( ${npm_install} == "true" ); then
                [ -d node_modules ] && rm -rf node_modules
                http_proxy=\'http://cahoproxy.ca.cgugroup:3128\' ; export http_proxy
                https_proxy=\'http://cahoproxy.ca.cgugroup:3128\' ; export https_proxy
                npm -loglevel verbose install
                #npm -loglevel  verbose install --registry https://nexus.ana.corp.aviva.com/repository/npm
                fi
                # Compile Jarvis code
                #npm -loglevel info install typescript --registry https://nexus.ana.corp.aviva.com/repository/npm
                #npm -loglevel info install typescript
                #npm -loglevel info install --registry https://nexus.ana.corp.aviva.com/repository/npm
                #npm -loglevel info  install

                # create a temporary directory to hold jarvis artifact zip
                [ ! -d /tmp/jarvisApp ] && mkdir -p /tmp/jarvisApp

                echo "Remove tarball if already exists"
                [ -f /tmp/jarvisApp/jarvis-1.0-SNAPSHOT.zip ] && rm -f /tmp/jarvisApp/jarvis-1.0-SNAPSHOT.zip

                echo "Create tarball of dist folder"
                #tar -cvzf catalyst_server_dist_001.tgz dist
                zip -r /tmp/jarvisApp/jarvis-1.0-SNAPSHOT.zip --exclude="*.git*" --exclude="*.yaml"  --exclude=\'*Dockerfile\' --exclude=\'*Jenkinsfile\' --exclude="*.gitignore"  .

                unset http_proxy
                unset https_proxy

                echo "Upload dist zip to maven repo"
                curl -v -u jarvisdeploy:jarvis123 --upload-file /tmp/jarvisApp/jarvis-1.0-SNAPSHOT.zip https://nexus.ana.corp.aviva.com/repository/aviva-jarvis-snapshot/aviva-jarvis/jarvis/1.0-SNAPSHOT/'''

            }
        }
    }
}
