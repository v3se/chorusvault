
resource "aws_apigatewayv2_integration" "integration" {
  api_id              = var.api_gw_id
  integration_uri     = var.lambda_invoke_arn
  integration_type    = "AWS_PROXY"
  integration_method  = var.integration_method
}

resource "aws_apigatewayv2_route" "route" {
  api_id            = var.api_gw_id
  route_key         = var.route_key
  target            = "integrations/${aws_apigatewayv2_integration.integration.id}"
  authorization_type = "JWT"
  authorizer_id      = var.api_gw_authorizer_id
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_invoke_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.api_gw_execution_arn}/*/*"
}