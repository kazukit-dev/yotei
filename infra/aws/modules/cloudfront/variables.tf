variable "domain" {
  type = string
}

variable "acm_arn" {
  type = string
}

variable "bucket" {
  type = object({
    id          = string
    domain_name = string
  })
}

