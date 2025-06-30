output "target_group" {
  value = {
    api = {
      arn = aws_lb_target_group.api.arn
    }
  }
}
