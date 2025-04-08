
# Output the DynamoDB table name and ARN
output "dynamodb_table_name" {
  value = module.dynamodb_songs.table_name
}

output "dynamodb_table_arn" {
  value = module.dynamodb_songs.table_arn
}


# Output the S3 bucket name and ARN for reference
output "s3_bucket_id" {
  value = module.s3_bucket_audio.s3_bucket_id
}

output "s3_bucket_arn" {
  value = module.s3_bucket_audio.s3_bucket_arn
}

output "user_pool_id" {
  value = module.cognito.user_pool_id
}

output "user_pool_client_id" {
  value = module.cognito.user_pool_client_id
}

output "api_url" {
  value = module.lambda_api_gateway.api_url
}

