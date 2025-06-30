variable "project" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "alb_sg_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "api_acm_arn" {
  type = string
}

variable "api_port" {
  type = number
}