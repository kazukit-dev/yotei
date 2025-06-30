provider "aws" {
  region = "ap-northeast-1"

  assume_role {
    role_arn     = "arn:aws:iam::125598197404:role/terraform-execution"
    session_name = "terraform-session"
  }

}

provider "cloudflare" {
  api_token = var.api_token
}
