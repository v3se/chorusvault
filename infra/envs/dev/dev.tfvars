### General ###

region       = "eu-central-1" # Set the region for the dev environment
project_name = "chorusvault"  # Set the project name (can be used across environments)
environment  = "dev"          # Set the environment (dev in this case)

### Cognito ###
user_pool_name         = "chorusvault-user-pool-dev" # Dev user pool name
user_pool_client_name  = "chorusvault-client-dev"    # Dev user pool client name
pre_sign_up_lambda_arn = ""                          # Leave empty if no Lambda is used
