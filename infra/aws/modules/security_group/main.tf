## alb
resource "aws_security_group" "alb" {
  vpc_id = var.vpc_id

  tags = {
    Name = "alb"
  }
}

resource "aws_vpc_security_group_ingress_rule" "alb_allow_tls_ipv4" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_ingress_rule" "alb_allow_tls_ipv6" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_ingress_rule" "alb_allow_http_ipv4" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "alb_allow_http_ipv6" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_egress_rule" "alb_allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.alb.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_allow_all_traffic_ipv6" {
  security_group_id = aws_security_group.alb.id
  ip_protocol       = "-1"
  cidr_ipv6         = "::/0"
}

## ecs
resource "aws_security_group" "ecs" {
  vpc_id = var.vpc_id

  tags = {
    Name = "ecs"
  }
}

resource "aws_vpc_security_group_ingress_rule" "api_allow_http_ipv6" {
  security_group_id = aws_security_group.ecs.id
  cidr_ipv6         = var.vpc_ipv6_cidr_block
  ip_protocol       = "tcp"
  from_port         = var.api_port
  to_port           = var.api_port
}

resource "aws_vpc_security_group_ingress_rule" "api_allow_http_ipv4" {
  security_group_id = aws_security_group.ecs.id
  cidr_ipv4         = var.vpc_ipv4_cidr_block
  ip_protocol       = "tcp"
  from_port         = var.api_port
  to_port           = var.api_port
}

resource "aws_vpc_security_group_egress_rule" "api_allow_all_traffic_ipv6" {
  security_group_id = aws_security_group.ecs.id
  ip_protocol       = "-1"
  cidr_ipv6         = "::/0"
}

resource "aws_vpc_security_group_egress_rule" "api_allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.ecs.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

## vpc_endpoint
resource "aws_security_group" "vpc_endpoint" {
  name   = "vpc-endpoint"
  vpc_id = var.vpc_id

  tags = {
    Name = "vpc-endpoint"
  }
}

resource "aws_vpc_security_group_ingress_rule" "endpoint_allow_tls_ipv6" {
  security_group_id = aws_security_group.vpc_endpoint.id
  cidr_ipv6         = var.vpc_ipv6_cidr_block
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_ingress_rule" "endpoint_allow_tls_ipv4" {
  security_group_id = aws_security_group.vpc_endpoint.id
  cidr_ipv4         = var.vpc_ipv4_cidr_block
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "endpoint_allow_all_traffic_ipv6" {
  security_group_id = aws_security_group.vpc_endpoint.id
  ip_protocol       = "-1"
  cidr_ipv6         = "::/0"
}

resource "aws_vpc_security_group_egress_rule" "endpoint_allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.vpc_endpoint.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}
