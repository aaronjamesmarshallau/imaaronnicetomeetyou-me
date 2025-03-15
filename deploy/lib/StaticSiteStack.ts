import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Distribution, PriceClass, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class StaticSiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (this.region !== 'us-east-1') {
      throw `Invalid region, must be us-east-1, was: ${this.region}`;
    }

    const DOMAIN_NAME = "imaaronnicetomeetyou.me";

    const cloudfrontCertificate = new Certificate(this, 'ApiCertificate', {
      domainName: DOMAIN_NAME,
    });

    // Create a bucket for the static website
    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      removalPolicy: RemovalPolicy.DESTROY, // Automatically deletes the bucket when the stack is deleted
      encryption: BucketEncryption.S3_MANAGED,
    });
  
    // Create CloudFront Distribution for the static website
    const distribution = new Distribution(this, 'CloudFrontDistribution', {
      defaultRootObject: 'index.html', // Set the default root object
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [
        DOMAIN_NAME
      ],
      certificate: cloudfrontCertificate,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ],
      priceClass: PriceClass.PRICE_CLASS_100, // Optional: Choose the CloudFront price class
    });

    // Output the Distribution endpoint
    new CfnOutput(this, 'DistributionEndpoint', {
      value: distribution.distributionDomainName
    });
  }
}