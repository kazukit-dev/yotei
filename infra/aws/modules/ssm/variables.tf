variable "project" {
  type        = string
  description = "Project name"
}

variable "cors_origin" {
  type        = string
  description = "CORS origin for the API"
}

variable "database_url" {
  type        = string
  description = "Database connection URL"
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
  description = "Secret key for signing cookies"
}

variable "port" {
  type        = number
  description = "Port on which the API server listens"
}
