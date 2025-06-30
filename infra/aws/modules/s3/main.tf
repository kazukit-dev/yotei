data "aws_iam_policy_document" "web" {
  statement {
    sid = "AllowCloudFrontServicePrincipal_${var.project}"
    principals {
      type        = "AWS"
      identifiers = [var.oai_arn]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.web.arn}/*"]
  }
}

resource "aws_s3_bucket" "web" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
  policy = data.aws_iam_policy_document.web.json
}

resource "aws_s3_bucket" "remote_backend" {
  bucket = "${var.project}-tf-backend"
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "${var.project}-tf-backend"
  }
}

resource "aws_s3_bucket_versioning" "remote_backend" {
  bucket = aws_s3_bucket.remote_backend.id
  versioning_configuration {
    status = "Enabled"
  }
}
