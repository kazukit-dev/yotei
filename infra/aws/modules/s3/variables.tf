variable "bucket_name" {
  type = string
}

variable "project" {
  type = string
}

variable "oai_arn" {
  type        = string
  description = "origin access identity ARN for S3 bucket access"
}
