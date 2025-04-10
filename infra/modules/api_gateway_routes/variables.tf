
variable "api_gw_id" {
  description = "ID of Api Gateway"
  type        = string
}

variable "lambda_invoke_name" {
  description = "The Invoke name of the Lambda function"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "The Invoke ARN of the Lambda function"
  type        = string
}

variable "route_key" {
  description = "Route Key for the Api Gateway Route"
  type        = string
}

variable "api_gw_authorizer_id" {
  description = "Api Gateway JWT Authorizer ID"
  type        = string
}

variable "api_gw_execution_arn" {
  description = "API Gateway Execution ARN"
  type        = string
}

variable "integration_method" {
  description = "API Gateway Integration method (POST, GET)"
  type        = string
}
