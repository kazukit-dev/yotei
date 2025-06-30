output "alb" {
  value = {
    id = aws_security_group.alb.id
  }
}

output "ecs" {
  value = {
    id = aws_security_group.ecs.id
  }
}

output "vpc_endpoint" {
  value = {
    id = aws_security_group.vpc_endpoint.id
  }
}
