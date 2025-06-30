terraform {
  backend "s3" {
    bucket = "yotei-tf-backend"
    key    = "aws.tfstate"
    region = "ap-northeast-1"
  }
}
