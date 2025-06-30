resource "aws_acm_certificate" "web" {
  domain_name       = var.web_domain
  validation_method = "DNS"
  provider          = aws.virginia

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "Web certificate"
  }
}

resource "aws_acm_certificate" "api" {
  domain_name       = var.api_domain
  validation_method = "DNS"
  provider          = aws

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "API certificate"
  }
}
