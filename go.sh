#!/usr/bin/env bash
set -euo pipefail

ECR_REPO="041260952467.dkr.ecr.ap-southeast-2.amazonaws.com"

command=$1

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
    API_VERSION=$version npx aws-cdk deploy --all --require-approval never
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
    cd ..
    aws s3 --region us-east-1 sync --delete dist s3://c167edda-e053-442a-8195-06d5-websitebucket75c24d94-qtquukauwtef/
    aws cloudfront create-invalidation --distribution-id E2PLYQTXWNZ7QL --paths /index.html
}

function publish_server {
    version=$2
    image="$ECR_REPO/i18u/server:$version"

    aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin $ECR_REPO

    docker build server -t "$image"
    docker push "$image"
}

function test_client {
    cd client

    npm install
    npm run test
}

function test_server {
    cd server

    docker compose run web gradle test
}

function localz {
    docker build server -t i18u-server:latest
    docker build client -t i18u-client:latest --build-arg VITE_API_URL=http://api.imaaronnicetomeetyou.me
    docker compose up
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
    test_client)
        test_client
        ;;
    test_server)
        test_server
        ;;
    local)
        localz
        ;;
    *)
        help
        ;;
esac