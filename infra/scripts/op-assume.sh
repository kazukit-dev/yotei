#!/bin/bash

#==============================================================================
# AWS Assume Role Script using 1Password
#==============================================================================
# Description: This script assumes an AWS IAM role using MFA credentials
#              stored in 1Password. It retrieves AWS credentials and MFA token
#              from 1Password, then assumes the specified role.
#
# Usage: ./op-assume.sh <vault_name> <role_arn>
#
# Prerequisites:
#   - 1Password CLI (op) must be installed and authenticated
#   - AWS CLI must be installed
#   - jq must be installed for JSON processing
#   - 1Password item "aws_cli" must exist with the following fields:
#     * access key id
#     * secret access key
#     * mfa serial
#     * OTP (one-time password) configured for MFA device
#
# Example:
#   ./op-assume.sh "Personal" "arn:aws:iam::123456789012:role/MyRole"
#==============================================================================

# Check if required arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <vault_name> <role_arn>"
    echo "Example: $0 'Personal' 'arn:aws:iam::123456789012:role/MyRole'"
    exit 1
fi

# 1Password vault name
VAULT=$1
# AWS IAM role ARN to assume
ROLE_ARN=$2

echo "Starting AWS role assumption process..."
echo "Vault: $VAULT"
echo "Role ARN: $ROLE_ARN"

# Retrieve AWS base credentials from 1Password
echo "Retrieving AWS credentials from 1Password..."
export ACCESS_KEY_ID=$(op item get "aws_cli" --vault "$VAULT" --fields "access key id")
export SECRET_ACCESS_KEY=$(op item get "aws_cli" --vault "$VAULT" --fields "secret access key" --reveal)

# Get MFA serial number and current MFA token
echo "Retrieving MFA information..."
MFA_SERIAL=$(op item get "aws_cli" --vault "$VAULT" --fields "mfa serial")
MFA_TOKEN=$(op item get "aws_cli" --vault "$VAULT" --otp)

echo "MFA Serial: $MFA_SERIAL"
echo "Assuming role with MFA authentication..."

# Assume the specified IAM role using STS with MFA
STS_CREDENTIALS=$(aws sts assume-role \
        --role-arn ${ROLE_ARN} \
        --serial-number ${MFA_SERIAL} \
        --role-session-name op-terraform-session \
        --token-code ${MFA_TOKEN} \
        --duration 3600 \
        --output json)

# Check if assume-role was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to assume role. Please check your credentials and role ARN."
    exit 1
fi

echo "Role assumed successfully!"
echo "Generating credentials output..."

# Output credentials in AWS credential format (compatible with aws configure)
echo "$STS_CREDENTIALS" | jq '{
    "Version": 1,
    "AccessKeyId": .Credentials.AccessKeyId,
    "SecretAccessKey": .Credentials.SecretAccessKey,
    "SessionToken": .Credentials.SessionToken,
    "Expiration": .Credentials.Expiration
}'

# Export temporary credentials as environment variables
echo "Setting up environment variables..."
export AWS_ACCESS_KEY_ID=$(echo "$STS_CREDENTIALS" | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo "$STS_CREDENTIALS" | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo "$STS_CREDENTIALS" | jq -r '.Credentials.SessionToken')

echo "Environment variables set successfully!"
echo "You can now use AWS CLI with the assumed role credentials."
echo "Session expires in 1 hour from now."
