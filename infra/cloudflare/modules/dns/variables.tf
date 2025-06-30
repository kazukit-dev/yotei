variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID for the domain"
}

variable "web_origin_domain" {
  type        = string
  description = "The origin domain for the web application, typically the CloudFront domain"
}

variable "api_origin_domain" {
  type        = string
  description = "The origin domain for the API, typically the ALB domain"
}

variable "web_cert" {
  type = object({
    name   = string
    target = string
  })
}

variable "api_cert" {
  type = object({
    name   = string
    target = string
  })
}
