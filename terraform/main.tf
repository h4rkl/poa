# Configure AWS provider
provider "aws" {
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key
  region     = var.aws_region
}

# Variables
variable "aws_access_key_id" {}
variable "aws_secret_access_key" {}
variable "aws_region" {}
variable "github_token" {}
variable "solana_rpc_endpoint" {}
variable "poa_signing_authority" {}
variable "poa_fees_acc" {}
variable "next_public_signing_authority" {}
variable "next_public_mint" {}
variable "next_public_token_vault" {}
variable "next_public_rewards_pool" {}
variable "next_public_cooldown_seconds" {}

# IAM role for Amplify
resource "aws_iam_role" "amplify_role" {
  name = "amplify-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
      }
    ]
  })
}

# Attach Amplify service role policy
resource "aws_iam_role_policy_attachment" "amplify_policy_attachment" {
  role       = aws_iam_role.amplify_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

# Amplify app
resource "aws_amplify_app" "explode_btn_app" {
  name         = "explode-btn-nextjs-app"
  repository   = "https://github.com/h4rkl/poa"
  access_token = var.github_token
  platform     = "WEB_COMPUTE"

  iam_service_role_arn = aws_iam_role.amplify_role.arn

  environment_variables = {
    NODE_VERSION = "20.11.1"
    
    # Private vars
    SOLANA_RPC_ENDPOINT      = var.solana_rpc_endpoint
    POA_SIGNING_AUTHORITY    = var.poa_signing_authority
    POA_FEES_ACC            = var.poa_fees_acc
    
    # Public vars
    NEXT_PUBLIC_SIGNING_AUTHORITY = var.next_public_signing_authority
    NEXT_PUBLIC_MINT             = var.next_public_mint
    NEXT_PUBLIC_TOKEN_VAULT      = var.next_public_token_vault
    NEXT_PUBLIC_REWARDS_POOL     = var.next_public_rewards_pool
    NEXT_PUBLIC_COOLDOWN_SECONDS = var.next_public_cooldown_seconds
  }

build_spec = <<-EOT
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install --frozen-lockfile
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
      - '../public/**/*'
      - '../package.json'
      - '../pnpm-lock.yaml'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
EOT
}

# Amplify branch
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.explode_btn_app.id
  branch_name = "main"
}

# Output
output "amplify_app_url" {
  value = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.explode_btn_app.id}.amplifyapp.com"
}
