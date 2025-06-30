variable "region" {
  type        = string
  default     = "ap-northeast-1"
  description = "AWS region to deploy resources in"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zones"
}

variable "project" {
  type        = string
  description = "Project name"
}

variable "web_domain" {
  type        = string
  description = "Domain for the application frontend"
}

variable "api_domain" {
  type        = string
  description = "Domain for the API"
}

variable "frontend_bucket_name" {
  type        = string
  description = "S3 bucket name for the frontend"
}

variable "api_port" {
  type        = number
  description = "Port on which the API server listens"
}

variable "database_url" {
  type        = string
  description = "Database connection URL"
}

variable "cors_origin" {
  type        = string
  description = "CORS origin for the API"
}

variable "cookie_domain" {
  type        = string
  description = "Domain for cookies"
}

variable "oauth_url" {
  type        = string
  description = "OAuth URL for authentication"
}

variable "oauth_redirect_url" {
  type        = string
  description = "OAuth redirect URL after authentication"
}

variable "oauth_client_id" {
  type        = string
  description = "OAuth client ID"
}

variable "oauth_client_secret" {
  type        = string
  description = "OAuth client secret"
}

variable "cookie_secret" {
  type        = string
  description = "Secret for signing cookies"
}
