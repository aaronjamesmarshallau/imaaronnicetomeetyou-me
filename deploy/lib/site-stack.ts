import * as cdk from "aws-cdk-lib";
import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  Distribution,
  PriceClass,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class SiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "SiteStatic", {
      removalPolicy: RemovalPolicy.DESTROY,
      publicReadAccess: false,
    });

    // const spaFunction = new EdgeFunction(this, 'SpaFunction', {
    // 	code: Code.fromAsset('./funcs'),
    // 	runtime: Runtime.NODEJS_14_X,
    // 	handler: 'spa/index.handler',
    // });

    const domainName = "imaaronnicetomeetyou.me";

    const cert = Certificate.fromCertificateArn(
      this,
      "imaaronnicetomeetyou-me-cert",
      "arn:aws:acm:us-east-1:041260952467:certificate/cf5e721f-3844-4500-93e3-add1c05daf62"
    );

    const distribution = new Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: new S3Origin(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        // edgeLambdas: [
        // 	{
        // 		functionVersion: spaFunction.currentVersion,
        // 		eventType: LambdaEdgeEventType.VIEWER_REQUEST,
        // 	}
        // ]
      },
      certificate: cert,
      domainNames: [domainName],
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultRootObject: "index.html",
    });

    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset("./dist")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/index.html"],
    });
  }
}
