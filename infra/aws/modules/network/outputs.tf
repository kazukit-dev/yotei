output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = [aws_subnet.public[0].id, aws_subnet.public[1].id]
}

output "private_subnet_ids" {
  value = [aws_subnet.private[0].id, aws_subnet.private[1].id]
}

output "vpc_ipv4_cidr_block" {
  value = aws_vpc.main.cidr_block
}

output "vpc_ipv6_cidr_block" {
  value = aws_vpc.main.ipv6_cidr_block
}

output "public_route_table_id" {
  value = aws_route_table.public.id
}

output "private_route_table_id" {
  value = aws_route_table.private.id
}
