locals {
  secrets = [
    {
      name      = "DATABASE_URL"
      valueFrom = var.ssm_arns.database_url
    },
    {
      name      = "CORS_ORIGIN"
      valueFrom = var.ssm_arns.cors_origin
    },
    {
      name      = "COOKIE_DOMAIN"
      valueFrom = var.ssm_arns.cookie_domain
    },
    {
      name      = "OAUTH_URL"
      valueFrom = var.ssm_arns.oauth_url
    },
    {
      name      = "OAUTH_REDIRECT_URI"
      valueFrom = var.ssm_arns.oauth_redirect_uri
    },
    {
      name      = "OAUTH_CLIENT_ID"
      valueFrom = var.ssm_arns.oauth_client_id
    },
    {
      name      = "OAUTH_CLIENT_SECRET"
      valueFrom = var.ssm_arns.oauth_client_secret
    },
    {
      name      = "COOKIE_SECRET"
      valueFrom = var.ssm_arns.cookie_secret
    },
    {
      name      = "PORT"
      valueFrom = var.ssm_arns.port
    }
  ]
}

resource "aws_ecs_cluster" "main" {
  name = var.project
}

resource "aws_ecs_service" "main" {
  name            = "${var.project}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "api-server"
    container_port   = var.api_port
  }

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "main" {
  family = "${var.project}-api"

  cpu    = 256
  memory = 512

  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "api-server"
      image     = "${var.repository_url}:latest"
      essential = true
      memory    = 128
      cpu       = 256
      portMappings = [
        {
          containerPort = var.api_port
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project}"
          "awslogs-region"        = "ap-northeast-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
      secrets : local.secrets
    }
  ])

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn
}

resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name              = "/ecs/${var.project}"
  retention_in_days = 7
}
