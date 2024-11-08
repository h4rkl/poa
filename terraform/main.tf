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
variable "next_public_solana_rpc" {}
variable "next_public_solana_rpc_name" {}
variable "poa_signing_authority" {}
variable "poa_fees_acc" {}
variable "next_public_signing_authority" {}
variable "next_public_signing_authority_ata" {}
variable "next_public_mint" {}
variable "next_public_token_pool_vault" {}
variable "next_public_token_fee_vault" {}
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
    POA_SIGNING_AUTHORITY = var.poa_signing_authority
    POA_FEES_ACC          = var.poa_fees_acc

    # Public vars
    NEXT_PUBLIC_SIGNING_AUTHORITY     = var.next_public_signing_authority
    NEXT_PUBLIC_SIGNING_AUTHORITY_ATA = var.next_public_signing_authority_ata
    NEXT_PUBLIC_MINT                  = var.next_public_mint
    NEXT_PUBLIC_TOKEN_POOL_VAULT      = var.next_public_token_pool_vault
    NEXT_PUBLIC_TOKEN_FEE_VAULT       = var.next_public_token_fee_vault
    NEXT_PUBLIC_COOLDOWN_SECONDS      = var.next_public_cooldown_seconds

    # Endpoints
    NEXT_PUBLIC_SOLANA_RPC      = var.next_public_solana_rpc
    SOLANA_RPC_ENDPOINT         = var.solana_rpc_endpoint
    NEXT_PUBLIC_SOLANA_RPC_NAME = var.next_public_solana_rpc_name
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
        - echo "NODE_VERSION=$NODE_VERSION" >> .env.local
        - echo "SOLANA_RPC_ENDPOINT=$SOLANA_RPC_ENDPOINT" >> .env.local
        - echo "NEXT_PUBLIC_SOLANA_RPC=$NEXT_PUBLIC_SOLANA_RPC" >> .env.local
        - echo "POA_SIGNING_AUTHORITY=$POA_SIGNING_AUTHORITY" >> .env.local 
        - echo "POA_FEES_ACC=$POA_FEES_ACC" >> .env.local
        - echo "NEXT_PUBLIC_SIGNING_AUTHORITY=$NEXT_PUBLIC_SIGNING_AUTHORITY" >> .env.local
        - echo "NEXT_PUBLIC_SIGNING_AUTHORITY_ATA=$NEXT_PUBLIC_SIGNING_AUTHORITY_ATA" >> .env.local
        - echo "NEXT_PUBLIC_MINT=$NEXT_PUBLIC_MINT" >> .env.local
        - echo "NEXT_PUBLIC_TOKEN_POOL_VAULT=$NEXT_PUBLIC_TOKEN_POOL_VAULT" >> .env.local
        - echo "NEXT_PUBLIC_TOKEN_FEE_VAULT=$NEXT_PUBLIC_TOKEN_FEE_VAULT" >> .env.local
        - echo "NEXT_PUBLIC_COOLDOWN_SECONDS=$NEXT_PUBLIC_COOLDOWN_SECONDS" >> .env.local
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
