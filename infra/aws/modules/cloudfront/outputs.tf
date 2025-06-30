output "oai_arn" {
  value = aws_cloudfront_origin_access_identity.web.iam_arn
}
