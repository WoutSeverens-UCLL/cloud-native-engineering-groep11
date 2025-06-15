#!/bin/bash

set -e  # Exit on error

# Set variables
storage_account="$AZURE_STORAGE_ACCOUNT"
sas_token="$AZURE_STORAGE_SAS_TOKEN"
source_dir="./frontend/out"
container_name="\$web"  # For static site, it's always $web

# Debug info
echo "Azure Storage Account: $storage_account"
echo "Destination Container: $container_name"
echo "Source Folder: $source_dir"

# Check env
if [[ -z "$storage_account" || -z "$sas_token" ]]; then
  echo "❌ Missing required environment variables."
  exit 1
fi

# Check if source folder exists
if [[ ! -d "$source_dir" ]]; then
  echo "❌ Error: Source folder '$source_dir' does not exist."
  exit 2
fi

# Upload files
az storage blob upload-batch \
  --account-name "$storage_account" \
  --destination \$web \
  --source "$source_dir" \
  --sas-token "$sas_token" \
  --overwrite

echo "✅ Static site successfully deployed to Azure Blob Storage."
