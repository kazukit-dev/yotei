output "app_acm_arn" {
  value = aws_acm_certificate.web.arn
}

output "api_acm_arn" {
  value = aws_acm_certificate.api.arn
}
