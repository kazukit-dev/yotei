terraform {
  backend "s3" {
    bucket = "yotei-tf-backend"
    key    = "cloudflare.tfstate"
    region = "ap-northeast-1"
  }
}
