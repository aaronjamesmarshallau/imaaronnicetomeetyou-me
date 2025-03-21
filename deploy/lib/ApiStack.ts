import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Vpc, SecurityGroup, Port, InstanceType, InstanceClass, InstanceSize, SubnetType, IpAddresses } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateTaskDefinition, FargateService, AwsLogDriver } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer, ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion, StorageType } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

interface ApiStackProps extends StackProps {
  apiVersion: string;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create a VPC for ECS
    const vpc = new Vpc(this, 'imaaronnicetomeetyou-me-vpc', {
      maxAzs: 3,
      natGateways: 0,
      subnetConfiguration: [
        {
          subnetType: SubnetType.PUBLIC,
          name: 'Public',
        },
        {
          subnetType: SubnetType.PRIVATE_ISOLATED,
          name: 'Private'
        }
      ]
    });
    
    // Create an RDS database instance
    const rdsSecurityGroup = new SecurityGroup(this, 'RdsSecurityGroup', {
      vpc,
      description: 'Allow ECS to access RDS',
      allowAllOutbound: true,
    });

    // Generate a database password using Secrets Manager
    const dbPassword = new Secret(this, 'DbPassword', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'i18u_service', // Default username for the DB
        }),
        generateStringKey: 'password', // The key for the generated password
        passwordLength: 16, // Length of the password
        excludePunctuation: true, // Exclude punctuation for simplicity
      },
    });

    // Generate a JWT Secret using Secrets Manager
    const jwtSecret = new Secret(this, 'JwtSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'jwtSecret', // The key for the generated key
        passwordLength: 32, // Length of the key
        excludePunctuation: true, // Exclude punctuation for simplicity
      },
    });

    const rdsInstance = new DatabaseInstance(this, 'RdsInstance', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_17_2,
      }),
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO), // Instance class size, e.g., T3.micro
      vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      securityGroups: [rdsSecurityGroup],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      multiAz: false,
      publiclyAccessible: false,
      allocatedStorage: 20,
      storageType: StorageType.GP3,
      databaseName: 'i18u',
      credentials: {
        username: 'i18u_service', // Replace with your preferred username
        password: dbPassword.secretValueFromJson('password')
      },
    });

    // Create an ECS cluster
    const cluster = new Cluster(this, 'EcsCluster', {
      vpc,
    });

    const ecrRepo = Repository.fromRepositoryName(this, 'EcrRepository', 'i18u/server')

    // Define the ECS task definition
    const taskDefinition = new FargateTaskDefinition(this, 'ApiTaskDef', {
      cpu: 512,
      memoryLimitMiB: 1024,
    });

    taskDefinition.addContainer('AppContainer', {
      image: ContainerImage.fromEcrRepository(ecrRepo, props.apiVersion), // Replace with your Docker image
      memoryLimitMiB: 1024,
      cpu: 512,
      stopTimeout: cdk.Duration.seconds(15),
      portMappings: [
        {
          containerPort: 5174,
        }
      ],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: "i18uServer"
      }),
      healthCheck: {
        command: [ "CMD-SHELL", "curl -f http://localhost:5174/api/blogs || exit 1" ],
        startPeriod: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        interval: cdk.Duration.seconds(15),
      },
      environment: {
        DB_DATABASE: 'i18u',
        DB_HOST: rdsInstance.dbInstanceEndpointAddress, // Placeholder, replace with actual RDS endpoint
        DB_PASS: dbPassword.secretValueFromJson("password").unsafeUnwrap(),
        DB_PORT: '5432',
        DB_USER: 'i18u_service',
        JWT_SECRET: jwtSecret.secretValueFromJson("jwtSecret").unsafeUnwrap(),
      },
    });

    // Create ECS service
    const fargateService = new FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      capacityProviderStrategies: [
        {
          capacityProvider: "FARGATE_SPOT",
          weight: 1,
        }
      ],
      assignPublicIp: true,
    });

    rdsInstance.connections.allowDefaultPortFrom(fargateService)

    // Allow inbound traffic from the ECS task's security group on the default RDS port (e.g., 3306 for MySQL)
    rdsSecurityGroup.addIngressRule(fargateService.connections.securityGroups[0], Port.tcp(5432));

    // Create an Application Load Balancer (ALB)
    const alb = new ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
    });

    const apiCertificate = new Certificate(this, 'ApiCertificate', {
      domainName: "api.imaaronnicetomeetyou.me",
    });

    const httpsListener = alb.addListener('HttpsListener', {
      port: 443,
      protocol: ApplicationProtocol.HTTPS,
      certificates: [
        apiCertificate
      ]
    });
    
    httpsListener.addTargets('AppTargets', {
      port: 5147,
      protocol: ApplicationProtocol.HTTP,
      targets: [fargateService],
      healthCheck: {
        path: "/api/blogs",
      }
    });

    // Output the RDS endpoint URL for reference
    new cdk.CfnOutput(this, 'RdsEndpoint', {
      value: rdsInstance.dbInstanceEndpointAddress,
    });
  }
}