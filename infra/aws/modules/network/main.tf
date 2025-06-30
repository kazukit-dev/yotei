# vpc
resource "aws_vpc" "main" {
  cidr_block                       = "10.0.0.0/16"
  assign_generated_ipv6_cidr_block = true
  enable_dns_support               = true
  enable_dns_hostnames             = true

  tags = {
    Name = "${var.project}-vpc"
  }
}

# public subnet
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  availability_zone = var.availability_zones[count.index]

  cidr_block = cidrsubnet(
    aws_vpc.main.cidr_block,
    8,
    2 * count.index
  )

  ipv6_cidr_block = cidrsubnet(
    aws_vpc.main.ipv6_cidr_block,
    8,
    2 * count.index
  )

  assign_ipv6_address_on_creation = true
  enable_dns64                    = true
  map_public_ip_on_launch         = true

  tags = {
    Name = "${var.project}-public-${var.availability_zones[count.index]}"
  }
}


resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  availability_zone = var.availability_zones[count.index]

  cidr_block = cidrsubnet(
    aws_vpc.main.cidr_block,
    8,
    2 * count.index + 1
  )
  ipv6_cidr_block = cidrsubnet(
    aws_vpc.main.ipv6_cidr_block,
    8,
    2 * count.index + 1
  )

  assign_ipv6_address_on_creation = true
  enable_dns64                    = true

  tags = {
    Name = "${var.project}-private-${var.availability_zones[count.index]}"
  }
}

# internet gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project}-igw"
  }
}

# egress only gateway
resource "aws_egress_only_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project}-egress"
  }
}

# public route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  route {
    ipv6_cidr_block = "::/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project}-public-rtb"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# private route table
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    ipv6_cidr_block        = "::/0"
    egress_only_gateway_id = aws_egress_only_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project}-private-rtb"
  }
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
