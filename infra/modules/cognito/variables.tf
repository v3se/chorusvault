variable "user_pool_name" {
  description = "The name of the Cognito User Pool"
  type        = string
}

variable "user_pool_client_name" {
  description = "The name of the Cognito User Pool Client"
  type        = string
}

variable "environment" {
  description = "The environment this resource belongs to (e.g., dev, prod)"
  type        = string
}

variable "region" {
  description = "The AWS region to deploy resources to"
  type        = string
}

# Optional: Lambda ARN for pre-signup triggers
variable "pre_sign_up_lambda_arn" {
  description = "ARN of the Lambda function to trigger during the pre-sign-up process"
  type        = string
  default     = ""  # Optional, leave blank if no Lambda is used.
}
