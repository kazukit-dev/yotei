resource "aws_cloudfront_origin_access_identity" "web" {}

resource "aws_cloudfront_cache_policy" "web" {
  name        = "cloudfront-cache-policy-s3-v2"
  min_ttl     = 1
  max_ttl     = 6000
  default_ttl = 600
  parameters_in_cache_key_and_forwarded_to_origin {
    headers_config {
      header_behavior = "none"
    }
    cookies_config {
      cookie_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_distribution" "web" {
  enabled = true
  aliases = [var.domain]

  default_root_object = "index.html"
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/"
  }

  origin {
    origin_id   = var.bucket.id
    domain_name = var.bucket.domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.web.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.bucket.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

    cache_policy_id = aws_cloudfront_cache_policy.web.id
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = var.acm_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  wait_for_deployment = false
}
