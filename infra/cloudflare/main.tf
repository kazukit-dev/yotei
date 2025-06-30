terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "~> 5"
    }
  }
}


data "aws_alb" "api" {
  name = var.alb_name
}

module "dns" {
  source = "./modules/dns"

  zone_id           = var.zone_id
  web_origin_domain = var.web_origin_domain
  api_origin_domain = data.aws_alb.api.dns_name
  web_cert          = var.web_cert
  api_cert          = var.api_cert
}
