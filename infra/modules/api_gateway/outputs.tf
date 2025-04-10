output "api_url" {
  value = "https://${aws_apigatewayv2_api.lambda.id}.execute-api.${var.region}.amazonaws.com/chorusvault_stage/upload_song"
}

output "api_gw_id" {
  value = aws_apigatewayv2_api.lambda.id
}
output "api_gw_authorizer_id" {
  value = aws_apigatewayv2_authorizer.cognito_authorizer.id
}

output "api_gw_execution_arn" {
  value = aws_apigatewayv2_api.lambda.execution_arn
}