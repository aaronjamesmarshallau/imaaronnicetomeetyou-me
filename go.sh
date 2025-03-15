#!/usr/bin/env bash
set -euo pipefail

ECR_REPO="041260952467.dkr.ecr.ap-southeast-2.amazonaws.com"

command=$1

function build_client {
    cd client

    npm install
    npm run build
    cp -R node_modules dist/node_modules
}

function build_server {
    cd server

    docker build . -t "$ECR_REPO/i18u/server:dev"
}

function deploy {
    version=$2
    cd deploy

    npm install
    API_VERSION=$version npx aws-cdk deploy --all
}

function help {
    echo "Usage: ./go.sh <command> [arguments]"
    echo "Commands:"
    echo "- build_client"
    echo "- build_server"
    echo "- help"
    echo "- package_client"
    echo "- publish_client"
    echo "- publish_server"
}

function package_client {
    cd client
    
    npm install
    VITE_API_URL='https://api.imaaronnicetomeetyou.me' npm run build

    cd dist
    zip -r ../dist.zip ./*
}

function publish_client {
    package_client
    aws s3 --region us-east-1 cp --recursive client/dist s3://c167edda-e053-442a-8195-06d5-websitebucket75c24d94-qtquukauwtef/
}

function publish_server {
    version=$2
    image="$ECR_REPO/i18u/server:$version"

    aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin $ECR_REPO

    docker build -t "$image" server
    docker push "$image"
}

case $command in
    build_client)
        build_client
        ;;
    build_server)
        build_server
        ;;
    deploy)
        deploy "$@"
        ;;
    help)
        help
        ;;
    package_client)
        package_client
        ;;
    publish_client)
        publish_client
        ;;
    publish_server)
        publish_server "$@"
        ;;
    *)
        help
        ;;
esac