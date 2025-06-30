variable "project" {
  type        = string
  description = "Project name"
}

variable "api_token" {
  type        = string
  description = "Cloudflare API token with permissions to manage DNS records"
}

variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID for the domain"
}

variable "web_origin_domain" {
  type = string
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

variable "alb_name" {
  type        = string
  description = "Application Load Balancer name"
}
