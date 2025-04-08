variable "region" {
  description = "The AWS region where resources will be deployed"
  type        = string
  default     = "eu-central-1" # Default to the eu-central-1 region
}

variable "project_name" {
  description = "The name of the project (used in resource names)"
  type        = string
  default     = "chorusvault" # Default project name
}

variable "environment" {
  description = "The environment to deploy to (e.g., dev, test, prod)"
  type        = string
  default     = "dev" # Default to the dev environment
}

variable "user_pool_name" {
  description = "The name of the Cognito User Pool"
  type        = string
}

variable "user_pool_client_name" {
  description = "The name of the Cognito User Pool Client"
  type        = string
}

variable "pre_sign_up_lambda_arn" {
  description = "ARN of the Lambda function to trigger during the pre-sign-up process"
  type        = string
  default     = "" # Optional, can be left empty if no Lambda is used
}
