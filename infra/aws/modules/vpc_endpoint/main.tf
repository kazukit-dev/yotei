
# for ECR
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_endpoint_type   = "Interface"
  vpc_id              = var.vpc_id
  subnet_ids          = var.subnet_ids
  security_group_ids  = var.security_group_ids
  service_name        = "com.amazonaws.ap-northeast-1.ecr.dkr"
  private_dns_enabled = true

  tags = {
    Name    = "ecr-dkr-endpoint"
    Purpose = "ECR Docker registry access from private subnets"
  }
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_endpoint_type   = "Interface"
  vpc_id              = var.vpc_id
  subnet_ids          = var.subnet_ids
  security_group_ids  = var.security_group_ids
  service_name        = "com.amazonaws.ap-northeast-1.ecr.api"
  private_dns_enabled = true

  tags = {
    Name    = "ecr-api-endpoint"
    Purpose = "ECR API access from private subnets"
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_endpoint_type = "Gateway"
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.ap-northeast-1.s3"
  route_table_ids   = var.private_route_table_ids

  tags = {
    Name    = "s3-endpoint"
    Purpose = "S3 access for ECR image layers from private subnets"
  }
}

# for Cloudwatch logs
resource "aws_vpc_endpoint" "logs" {
  vpc_endpoint_type   = "Interface"
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.ap-northeast-1.logs"
  subnet_ids          = var.subnet_ids
  security_group_ids  = var.security_group_ids
  private_dns_enabled = true

  tags = {
    Name    = "logs-endpoint"
    Purpose = "CloudWatch Logs access from private subnets"
  }
}

resource "aws_vpc_endpoint" "ssm" {
  vpc_endpoint_type   = "Interface"
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.ap-northeast-1.ssm"
  subnet_ids          = var.subnet_ids
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids

  tags = {
    Name    = "ssm-endpoint"
    Purpose = "SSM access from private subnets"
  }
}

resource "aws_vpc_endpoint" "ssmmessages" {
  vpc_endpoint_type   = "Interface"
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.ap-northeast-1.ssmmessages"
  subnet_ids          = var.subnet_ids
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids

  tags = {
    Name    = "ssmmessages-endpoint"
    Purpose = "SSM messages access from private subnets"
  }
}
