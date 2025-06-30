terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5"
    }
  }
}

module "network" {
  source             = "./modules/network"
  project            = var.project
  region             = var.region
  availability_zones = var.availability_zones
}

module "iam" {
  source = "./modules/iam"

  project = var.project
}

module "acm" {
  source     = "./modules/acm"
  web_domain = var.web_domain
  api_domain = var.api_domain

  providers = {
    aws          = aws
    aws.virginia = aws.virginia
  }
}

module "s3" {
  source = "./modules/s3"

  project     = var.project
  bucket_name = var.frontend_bucket_name
  oai_arn     = module.cloudfront.oai_arn
}

module "cloudfront" {
  source = "./modules/cloudfront"

  domain  = var.web_domain
  acm_arn = module.acm.app_acm_arn
  bucket = {
    id          = module.s3.web.id
    domain_name = module.s3.web.domain_name
  }
}

module "security_group" {
  source = "./modules/security_group"

  project             = var.project
  vpc_id              = module.network.vpc_id
  api_port            = var.api_port
  vpc_ipv4_cidr_block = module.network.vpc_ipv4_cidr_block
  vpc_ipv6_cidr_block = module.network.vpc_ipv6_cidr_block
}

module "load_balancer" {
  source = "./modules/load_balancer"

  project     = var.project
  api_port    = var.api_port
  vpc_id      = module.network.vpc_id
  alb_sg_id   = module.security_group.alb.id
  subnet_ids  = module.network.public_subnet_ids
  api_acm_arn = module.acm.api_acm_arn
}

module "ecr" {
  source = "./modules/ecr"

  project = var.project
}

module "ecs" {
  source = "./modules/ecs"

  project            = var.project
  execution_role_arn = module.iam.ecs_execution_role_arn
  task_role_arn      = module.iam.ecs_task_role_arn
  subnet_ids         = module.network.private_subnet_ids
  repository_url     = module.ecr.repository_url
  api_port           = var.api_port
  target_group_arn   = module.load_balancer.target_group.api.arn
  security_group_ids = [module.security_group.ecs.id]
  ssm_arns           = module.ssm.parameter_arns
}

module "vpc_endpoint" {
  source = "./modules/vpc_endpoint"

  vpc_id                  = module.network.vpc_id
  subnet_ids              = module.network.private_subnet_ids
  security_group_ids      = [module.security_group.vpc_endpoint.id]
  private_route_table_ids = [module.network.private_route_table_id]
}

module "ssm" {
  source = "./modules/ssm"

  project             = var.project
  database_url        = var.database_url
  cors_origin         = var.cors_origin
  cookie_domain       = var.cookie_domain
  oauth_url           = var.oauth_url
  oauth_redirect_url  = var.oauth_redirect_url
  oauth_client_id     = var.oauth_client_id
  oauth_client_secret = var.oauth_client_secret
  cookie_secret       = var.cookie_secret
  port                = var.api_port
}
