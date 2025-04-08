terraform {
  backend "s3" {
    bucket       = "chorusvault-tfstate-dev"
    key          = "terraform.tfstate"
    region       = "eu-central-1"
    use_lockfile = true
    encrypt      = true
  }
}