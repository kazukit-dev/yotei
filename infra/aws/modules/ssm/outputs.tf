output "parameter_arns" {
  value = {
    database_url        = aws_ssm_parameter.database_url.arn
    cors_origin         = aws_ssm_parameter.cors_origin.arn
    cookie_domain       = aws_ssm_parameter.cookie_domain.arn
    oauth_url           = aws_ssm_parameter.oauth_url.arn
    oauth_redirect_uri  = aws_ssm_parameter.oauth_redirect_uri.arn
    oauth_client_id     = aws_ssm_parameter.oauth_client_id.arn
    oauth_client_secret = aws_ssm_parameter.oauth_client_secret.arn
    cookie_secret       = aws_ssm_parameter.cookie_secret.arn
    port                = aws_ssm_parameter.port.arn
  }
}
