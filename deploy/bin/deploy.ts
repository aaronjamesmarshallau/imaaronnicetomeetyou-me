#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/ApiStack';
import { StaticSiteStack } from '../lib/StaticSiteStack';

const app = new cdk.App();

const apiVersion = process.env.API_VERSION;

if (apiVersion === undefined) {
  throw "API_VERSION is required";
}

new ApiStack(app, 'c32ad3cf-4b6f-4f9b-b310-86483ebca8ce', {
  tags: {
    "StackName": "ApiStack"
  },
  apiVersion,
});

new StaticSiteStack(app, 'c167edda-e053-442a-8195-06d51702f5d9', {
  tags: {
    "StackName": "StaticSiteStack"
  },
  env: { region: 'us-east-1' }
});