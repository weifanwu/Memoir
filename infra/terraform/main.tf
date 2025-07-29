terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.35.0"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

resource "aws_s3_bucket" "diary_images" {
  bucket = "memoir-diary-pics"

  tags = {
    Name        = "MemoirDiaryImages"
    Environment = "dev"
  }
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role_minimal"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_lambda_function" "my_lambda" {
  function_name = "my_lambda_function"
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  filename         = "${path.module}/lambda/lambda_function.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda/lambda_function.zip")

  role    = aws_iam_role.lambda_exec_role.arn
  timeout = 10
}

# 创建 user 表
resource "aws_dynamodb_table" "user_table" {
  name           = "user"
  billing_mode   = "PAY_PER_REQUEST" # 按需计费
  hash_key       = "userid"

  attribute {
    name = "userid"
    type = "S"
  }

  tags = {
    Environment = "dev"
    Project     = "diary-app"
  }
}

# 创建 diary 表
resource "aws_dynamodb_table" "diary_table" {
  name           = "diary"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "diaryid"

  attribute {
    name = "diaryid"
    type = "S"
  }

  tags = {
    Environment = "dev"
    Project     = "diary-app"
  }
}