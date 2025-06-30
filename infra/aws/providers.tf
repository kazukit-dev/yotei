provider "aws" {
  region = var.region

  assume_role {
    role_arn     = "arn:aws:iam::125598197404:role/terraform-execution"
    session_name = "terraform-session"
  }

  default_tags {
    tags = {
      project    = var.project
      managed_by = "terraform"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "virginia"

  default_tags {
    tags = {
      project    = var.project
      managed_by = "terraform"
    }
  }
}
