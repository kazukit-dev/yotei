resource "aws_ssm_parameter" "cors_origin" {
  name  = "/${var.project}/cors-origin"
  type  = "String"
  value = var.cors_origin
}

resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project}/database-url"
  type  = "SecureString"
  value = var.database_url
}

resource "aws_ssm_parameter" "cookie_domain" {
  name  = "/${var.project}/cookie-domain"
  type  = "String"
  value = var.cookie_domain
}

resource "aws_ssm_parameter" "oauth_url" {
  name  = "/${var.project}/oauth-url"
  type  = "String"
  value = var.oauth_url
}

resource "aws_ssm_parameter" "oauth_redirect_uri" {
  name  = "/${var.project}/oauth-redirect-uri"
  type  = "String"
  value = var.oauth_redirect_url
}

resource "aws_ssm_parameter" "oauth_client_id" {
  name  = "/${var.project}/oauth-client-id"
  type  = "String"
  value = var.oauth_client_id
}

resource "aws_ssm_parameter" "oauth_client_secret" {
  name  = "/${var.project}/oauth-client-secret"
  type  = "SecureString"
  value = var.oauth_client_secret
}

resource "aws_ssm_parameter" "cookie_secret" {
  name  = "/${var.project}/cookie-secret"
  type  = "SecureString"
  value = var.cookie_secret
}

resource "aws_ssm_parameter" "port" {
  name  = "/${var.project}/port"
  type  = "String"
  value = tostring(var.port)
}
