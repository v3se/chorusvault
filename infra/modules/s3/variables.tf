variable "project_name" {
  type        = string
  description = "Project name for naming resources"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev/test/prod)"
}

variable "bucket_name" {
  type        = string
  description = "S3 Bucket Name"
}

variable "enable_static_website" {
  description = "Flag to enable static website hosting"
  type        = bool
  default     = false  # You can set the default to false, so the website block is not included by default
}

variable "enable_cors" {
  description = "Enable CORS for the bucket"
  type        = bool
  default     = false  # You can set the default to false, so the website block is not included by default
}