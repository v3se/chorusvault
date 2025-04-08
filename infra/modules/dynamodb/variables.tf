variable "project_name" {
  description = "The name of the project (used in resource names)"
  type        = string
}

variable "environment" {
  description = "The environment to deploy to (e.g., dev, test, prod)"
  type        = string
}

variable "table_name" {
  description = "The Name of the DynamoDB table"
  type        = string
}

variable "hash_key" {
  description = "Primary partition key"
  type        = string
  default     = "song_id"
}

variable "range_key" {
  description = "Primary sort key (optional)"
  type        = string
  default     = "version"
}

variable "extra_attributes" {
  description = "Additional attributes to define in the table"
  type = list(object({
    name = string
    type = string
  }))
  default = [
    {
      name = "timestamp"
      type = "S"
    }
  ]
}

variable "gsi" {
  description = "Global Secondary Indexes"
  type = list(object({
    name            = string
    hash_key        = string
    projection_type = string
  }))
  default = [
    {
      name            = "timestamp-index"
      hash_key        = "timestamp"
      projection_type = "ALL"
    }
  ]
}