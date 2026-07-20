#!/bin/bash
# LocalStack Initialization Script
# Creates required AWS resources for local development

set -e

echo "Initialising LocalStack AWS resources..."

# S3 bucket
awslocal s3 mb s3://shiftly-uploads --region ap-south-1

# Configure S3 CORS for direct browser uploads
awslocal s3api put-bucket-cors \
  --bucket shiftly-uploads \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["http://localhost:5173"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'

# SNS topic for SMS
awslocal sns create-topic --name shiftly-sms --region ap-south-1

# SES email identity (verify for local use)
awslocal ses verify-email-identity --email-address noreply@shiftly.com --region ap-south-1

echo "✅ LocalStack initialised successfully"
echo "  - S3 bucket: shiftly-uploads"
echo "  - SNS topic: shiftly-sms"
echo "  - SES email: noreply@shiftly.com"
