#!/bin/bash

# Set your AWS region
AWS_REGION="eu-central-1"
PROJECT_NAME="chorusvault"
ENVIRONMENT="dev"
export AWS_PROFILE="tf"

# Create the S3 bucket for Terraform state
echo "Creating S3 bucket for Terraform state..."
aws s3api create-bucket \
  --bucket "${PROJECT_NAME}-tfstate-${ENVIRONMENT}" \
  --region "${AWS_REGION}" \
  --create-bucket-configuration LocationConstraint="${AWS_REGION}"

# Enable versioning on the S3 bucket
echo "Enabling versioning on the S3 bucket..."
aws s3api put-bucket-versioning \
  --bucket "${PROJECT_NAME}-tfstate-${ENVIRONMENT}" \
  --versioning-configuration Status=Enabled

echo "✅ Backend resources (S3 bucket)"
