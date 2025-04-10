# API Gateway for ChorusVault
resource "aws_apigatewayv2_api" "lambda" {
  name          = "chorusvault_api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]  # Allow all origins or specify your frontend URL here
    allow_methods = ["GET", "POST", "OPTIONS"]  # Allow necessary methods
    allow_headers = ["Content-Type", "Authorization"]  # Allow necessary headers
    expose_headers = ["Content-Type", "Authorization"]  # Expose headers if needed
    max_age = 3600  # Cache preflight response for 1 hour
  }
}

# Cognito Authorizer for API Gateway
resource "aws_apigatewayv2_authorizer" "cognito_authorizer" {
  name             = "CognitoAuthorizer"
  api_id           = aws_apigatewayv2_api.lambda.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [var.cognito_user_pool_client_id]
    issuer   = "https://cognito-idp.${var.region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

# API Gateway stage for ChorusVault
resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  name        = "chorusvault_stage"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

# Integration for the upload_song route
resource "aws_apigatewayv2_integration" "upload_song_integration" {
  api_id              = aws_apigatewayv2_api.lambda.id
  integration_uri     = var.upload_song_lambda_invoke_arn
  integration_type    = "AWS_PROXY"
  integration_method  = "POST"
}

# Route for upload_song with JWT authentication
resource "aws_apigatewayv2_route" "upload_song_route" {
  api_id            = aws_apigatewayv2_api.lambda.id
  route_key         = "POST /upload_song"
  target            = "integrations/${aws_apigatewayv2_integration.upload_song_integration.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_authorizer.id
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.lambda.name}"

  retention_in_days = 30
}

# Lambda Permission to allow API Gateway to invoke the Lambda
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.upload_song_lambda_invoke_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}
