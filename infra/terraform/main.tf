provider "aws" {
  region = "ca-central-1"
}

# 1. S3 Bucket
resource "aws_s3_bucket" "memoir_storage" {
  bucket = "memoir-project-bucket"
}