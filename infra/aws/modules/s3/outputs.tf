output "web" {
  value = {
    id          = aws_s3_bucket.web.id
    domain_name = aws_s3_bucket.web.bucket_regional_domain_name
  }
}
