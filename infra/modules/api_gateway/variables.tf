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

