import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Vpc, SecurityGroup, Port, InstanceType, InstanceClass, InstanceSize, SubnetType, Peer } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage, FargateTaskDefinition, FargateService, AwsLogDriver, Protocol, CfnService, EcsOptimizedImage, TaskDefinition, Compatibility, NetworkMode, Ec2Service, AmiHardwareType } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion, StorageType } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Repository } from 'aws-cdk-lib/aws-ecr';

interface ApiStackProps extends StackProps {
  apiVersion: string;
  tunnelToken: string;
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
      vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
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

    // Create an Auto Scaling Group for EC2 instances
    cluster.addCapacity('ClusterAutoScalingGroup', {
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      minCapacity: 1,
      maxCapacity: 2,
      desiredCapacity: 1,
      machineImage: EcsOptimizedImage.amazonLinux2(AmiHardwareType.ARM),
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC
      },
      associatePublicIpAddress: true,
      spotPrice: '0.0106',
    });

    const ecrRepo = Repository.fromRepositoryName(this, 'EcrRepository', 'i18u/server')

    // Define the ECS task definition
    const taskDefinition = new TaskDefinition(this, 'ApiTaskDef', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
      family: "i18u-me-api"
    });

    taskDefinition.addContainer('AppContainer', {
      image: ContainerImage.fromEcrRepository(ecrRepo, props.apiVersion), // Replace with your Docker image
      memoryLimitMiB: 512,
      cpu: 512,
      stopTimeout: cdk.Duration.seconds(15),
      portMappings: [
        {
          containerPort: 5174,
          hostPort: 5174
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

    taskDefinition.addContainer("CloudflaredContainer", {
      cpu: 512,
      memoryLimitMiB: 384,
      essential: true,
      image: ContainerImage.fromRegistry("cloudflare/cloudflared:2025.2.1"),
      environment: {
        "TUNNEL_TOKEN": props.tunnelToken
      },
      portMappings: [
        {
          hostPort: 2000,
          containerPort: 2000,
          protocol: Protocol.TCP,
        }
      ],
      command: ["tunnel", "--metrics", "0.0.0.0:2000", "run"]
    });

    // Create ECS service
    const ec2Service = new Ec2Service(this, 'EC2Service', {
      cluster,
      taskDefinition,
      desiredCount: 1,
    });

    const scaling = ec2Service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 2,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 80,
    });

    (ec2Service.node.defaultChild as CfnService).loadBalancers = [];

    rdsInstance.connections.allowDefaultPortFrom(ec2Service)

    const fargateServiceSG = ec2Service.connections.securityGroups[0];

    // Allow inbound traffic from the ECS task's security group on the default RDS port (e.g., 3306 for MySQL)
    rdsSecurityGroup.addIngressRule(fargateServiceSG, Port.tcp(5432));

    fargateServiceSG.addEgressRule(Peer.anyIpv4(), Port.allTcp());

    // Output the RDS endpoint URL for reference
    new cdk.CfnOutput(this, 'RdsEndpoint', {
      value: rdsInstance.dbInstanceEndpointAddress,
    });
  }
}