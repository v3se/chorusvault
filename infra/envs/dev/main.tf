provider "aws" {
  region = var.region # Using the region from the variable
}


module "s3_lambda_code" {
  source       = "../../modules/s3"
  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "lambda-code"
}


module "s3_static_website" {
  source       = "../../modules/s3"
  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "website"
  enable_static_website = true
}

# S3 Bucket for Terraform audio Storage
module "s3_bucket_audio" {
  source       = "../../modules/s3"
  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "audio"
  enable_cors  = true
}

module "cognito" {
  source = "../../modules/cognito" # Reference to the Cognito module

  # Pass in environment-specific variables (e.g., dev environment values)
  environment           = var.environment
  user_pool_name        = "${var.project_name}-user-pool-${var.environment}"
  user_pool_client_name = "${var.project_name}-client-${var.environment}"
  region                = var.region # Using the region from the variable
}

module "dynamodb_songs" {
  source       = "../../modules/dynamodb"
  project_name = "chorusvault"
  environment  = "dev"
  table_name   = "songs"

  # Optionally override defaults
  hash_key  = "song_id"
  range_key = "version"

  extra_attributes = [
    {
      name = "timestamp"
      type = "S"
    }
  ]

  gsi = [
    {
      name            = "timestamp-index"
      hash_key        = "timestamp"
      projection_type = "ALL"
    }
  ]
}


module "lambda_upload_songs" {
  source           = "../../modules/lambda"
  function_name    = "upload_song_function"
  lambda_bucket_id = module.s3_lambda_code.s3_bucket_id
  handler          = "lambda/upload_song/index.handler"
  runtime          = "nodejs22.x"
  timeout          = 60
  memory_size      = 128
  lambda_code_path = "../../../lambda/upload_song"
  environment_variables = {
    S3_BUCKET_NAME = module.s3_bucket_audio.s3_bucket_id
    DYNAMODB_TABLE = module.dynamodb_songs.table_name
  }
  iam_policy_json = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:s3:::${module.s3_bucket_audio.s3_bucket_id}/*"
      },
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ],
        Effect   = "Allow",
        Resource = module.dynamodb_songs.table_arn
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

module "lambda_download_songs" {
  source           = "../../modules/lambda"
  function_name    = "download_song_function"
  lambda_bucket_id = module.s3_lambda_code.s3_bucket_id
  handler          = "lambda/download_song/index.handler"
  runtime          = "nodejs22.x"
  timeout          = 60
  memory_size      = 128
  lambda_code_path = "../../../lambda/download_song"
  environment_variables = {
    S3_BUCKET_NAME = module.s3_bucket_audio.s3_bucket_id
    DYNAMODB_TABLE = module.dynamodb_songs.table_name
  }
  iam_policy_json = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:s3:::${module.s3_bucket_audio.s3_bucket_id}/*"
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Lambda and API Gateway Module
module "lambda_api_gateway" {
  source = "../../modules/api_gateway" # Reference to the Lambda and API Gateway module

  # Pass the required variables
  s3_bucket_name                 = module.s3_bucket_audio.s3_bucket_id # Referencing the output from S3 module
  dynamodb_table_name            = module.dynamodb_songs.table_name      # Referencing the DynamoDB table
  upload_song_lambda_invoke_arn  = module.lambda_upload_songs.lambda_invoke_arn
  upload_song_lambda_invoke_name = module.lambda_upload_songs.lambda_name
  download_song_lambda_invoke_arn  = module.lambda_download_songs.lambda_invoke_arn
  download_song_lambda_invoke_name = module.lambda_download_songs.lambda_name
  region                         = var.region
  cognito_user_pool_client_id    = module.cognito.user_pool_client_id
  cognito_user_pool_id           = module.cognito.user_pool_id
}