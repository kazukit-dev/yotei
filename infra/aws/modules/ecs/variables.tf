variable "project" {
  type = string
}

variable "repository_url" {
  type        = string
  description = "ECR repository URL for the container image"
}

variable "execution_role_arn" {
  type        = string
  description = "ARN of the ECS task execution role"
}

variable "task_role_arn" {
  type        = string
  description = "ARN of the ECS task role"
}

variable "api_port" {
  type        = number
  description = "value of the port on which the API server listens"
}

variable "target_group_arn" {
  type        = string
  description = "value of the ARN of the API target group"
}

variable "subnet_ids" {
  type        = list(string)
  description = "List of subnet IDs for the ECS service"
}

variable "security_group_ids" {
  type = list(string)
}

variable "ssm_arns" {

  type = object({
    database_url        = string
    cors_origin         = string
    cookie_domain       = string
    oauth_url           = string
    oauth_redirect_uri  = string
    oauth_client_id     = string
    oauth_client_secret = string
    cookie_secret       = string
    port                = string
  })

  description = "Map of SSM parameter ARNs"
}
