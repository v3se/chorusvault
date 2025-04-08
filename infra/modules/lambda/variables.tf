variable "lambda_code_path" {
  description = "Path to the Lambda deployment package (ZIP)"
  type        = string
}

variable "iam_policy_json" {
  description = "IAM policy document in JSON format"
  type        = string
}


variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_bucket_id" {
  description = "Lambda S3 Bucket ID where the code will be stored"
  type        = string
}

variable "handler" {
  description = "Lambda function handler"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime environment"
  type        = string
}

variable "timeout" {
  description = "Function execution timeout (seconds)"
  type        = number
  default     = 10
}

variable "memory_size" {
  description = "Amount of memory in MB the Lambda function can use"
  type        = number
  default     = 128
}

variable "environment_variables" {
  description = "Environment variables for Lambda"
  type        = map(string)
  default     = {}
}
