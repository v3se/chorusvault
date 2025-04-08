output "api_url" {
  value = "https://${aws_apigatewayv2_api.lambda.id}.execute-api.${var.region}.amazonaws.com/dev/upload-song"
}
