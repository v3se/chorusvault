resource "aws_s3_bucket" "s3_bucket" {
  bucket = "${var.project_name}-${var.environment}-${var.bucket_name}"

  tags = {
    Name        = "${var.project_name}-${var.environment}-${var.bucket_name}"
    Environment = var.environment
    Project     = var.project_name
  }
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "website_config" {
  count  = var.enable_static_website == true ? 1 : 0  # Conditionally create this resource

  bucket = aws_s3_bucket.s3_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_cors_configuration" "cors" {
  count  = var.enable_cors == true ? 1 : 0
  bucket = aws_s3_bucket.s3_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["*"]  # or "http://localhost:3000", etc.
    expose_headers  = ["ETag", "Content-Type"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.s3_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}
