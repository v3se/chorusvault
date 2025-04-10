
variable "s3_bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
}

variable "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  type        = string
}

variable "upload_song_lambda_invoke_arn" {
  description = "The name of the Lambda function"
  type        = string
}

variable "upload_song_lambda_invoke_name" {
  description = "The name of the Lambda function"
  type        = string
}

variable "cognito_user_pool_client_id" {
  description = "The ID of Cognito user pool client ID for JWT authorization for the API"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "The ID of Cognito user pool ID for JWT authorization for the API"
  type        = string
}

variable "region" {
  description = "Region"
  type        = string
}

