resource "aws_cognito_user_pool" "user_pool" {
  # Reference to the user pool name variable
  name = var.user_pool_name

  # Auto-verify email during sign-up
  auto_verified_attributes = ["email"]
  
  # Disable multi-factor authentication (MFA)
  mfa_configuration = "OFF"
  
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Define user pool schema for required and optional attributes
  schema {
    name               = "email"
    attribute_data_type = "String"
    required            = true
  }

  schema {
    name               = "name"
    attribute_data_type = "String"
    required            = false
  }

  # Tagging for environment differentiation
  tags = {
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  # Reference to the user pool client name variable
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.user_pool.id

  # Define the authentication flows
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

  # Disable client secret generation for this public client
  generate_secret = false
}

resource "aws_cognito_user" "admin_user" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  username     = "vese"
  password     = "Kissa123!"

  attributes = {
    email          = "robertvesterinen@gmail.com"
    email_verified = true
  }
}
