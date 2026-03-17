# AWS Integration Setup Guide

To enable the cloud-native features of the Fleet Management Webapp (S3 Analytics Export, Log Archiving, and Lambda-powered Analytics), you need to configure AWS credentials and resources.

## 1. Create IAM User (First Step)

Before you can get credentials, you need an IAM User in AWS to act on behalf of your application.

1.  Log in to the **AWS Console** and search for **IAM**.
2.  Click **Users** in the sidebar -> **Create user**.
3.  Name the user `fleet-app-user` (or similar).
4.  **Permissions options**: Select "Attach policies directly".
5.  Search for and select:
    *   `AmazonS3FullAccess` (Simplest for dev; allows reading/writing to any bucket)
    *   `AWSLambda_FullAccess` (Allows invoking functions)
    *   *(For production, see the "Custom IAM Policy" section below instead)*
6.  Complete the creation process.
7.  Click on your new user -> **Security credentials** tab.
8.  Scroll to **Access keys** -> **Create access key**.
9.  Select **"Application running outside AWS"** -> Next -> Create access key.
10. **Copy** the `Access key ID` and `Secret access key` immediately. This is the **only** time you will see the secret key.

## 2. AWS Credentials Configuration

The application uses the AWS SDK for JavaScript v3, which automatically loads credentials from your environment.

### Option A: .env File (Recommended for Local Development)

We have added the following variables to your `.env` file in the project root. fill them in with your AWS IAM user credentials:

```env
AWS_ACCESS_KEY_ID="your_access_key_id"
AWS_SECRET_ACCESS_KEY="your_secret_access_key"
AWS_REGION="us-east-1"
```

**Security Warning:** Never commit your `.env` file to version control (git). It is already included in `.gitignore`.

### Option B: Shared Credentials File

If you have the AWS CLI installed, you can run:

```bash
aws configure
```

This will create a `~/.aws/credentials` file that the SDK will automatically use.

## 3. Required AWS Resources

You need to create the following resources in your AWS account:

1.  **S3 Bucket for Analytics Data** (e.g., `fleet-analytics-data-123`)
2.  **S3 Bucket for App Logs** (e.g., `fleet-app-logs-123`)
3.  **(Optional) Lambda Function** for heavy computation

### Resource Naming

Update your `.env` file with the actual names of the resources you created:

```env
AWS_S3_ANALYTICS_BUCKET="your-analytics-bucket-name"
AWS_S3_LOGS_BUCKET="your-logs-bucket-name"
AWS_LAMBDA_ANALYTICS_FUNCTION="your-lambda-function-name"
```

## 4. Custom IAM Policy (Production)

The IAM User or Role used by the application requires the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-analytics-bucket-name/*",
                "arn:aws:s3:::your-logs-bucket-name/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "lambda:InvokeFunction",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:your-lambda-function-name"
        }
    ]
}
```

## 5. Verifying the Connection

Once configured, you can test the integration by starting the server and hitting the health check endpoint (if implemented) or checking the logs on startup.

If credentials are missing or invalid, the AWS features (Analytics, Logs Export) will be disabled or throw errors, but the core application will continue to work.
