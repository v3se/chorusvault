data "archive_file" "lambda_zip_archive" {
  type = "zip"

  source_dir  = var.lambda_code_path
  output_path =  join(".", [var.function_name, "zip"])
}

resource "aws_s3_object" "lambda_s3_code_object" {
  bucket = var.lambda_bucket_id

  key    = join(".", [var.function_name, "zip"])
  source = data.archive_file.lambda_zip_archive.output_path

  etag = filemd5(data.archive_file.lambda_zip_archive.output_path)
}


resource "aws_lambda_function" "lambda_function" {
  s3_bucket = var.lambda_bucket_id
  s3_key    = aws_s3_object.lambda_s3_code_object.key
  function_name    = var.function_name
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = var.handler
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  source_code_hash = data.archive_file.lambda_zip_archive.output_base64sha256

environment {
  variables = var.environment_variables
  }
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role_${var.function_name}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.function_name}-lambda-policy"
  description = "Lambda execution policy"

  policy = var.iam_policy_json
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

