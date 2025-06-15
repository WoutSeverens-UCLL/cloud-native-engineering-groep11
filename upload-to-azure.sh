#!/bin/bash

# Set your Azure Storage account name, container name, and SAS token
storage_account="$AZURE_STORAGE_ACCOUNT"
container_name="$AZURE_STORAGE_CONTAINER"
sas_token="$AZURE_STORAGE_SAS_TOKEN"

# Set the local folder path
#!/bin/bash

set -e  # Exit script on any error

# Print environment info (for debugging in CI/CD)
echo "Azure Storage Account: $AZURE_STORAGE_ACCOUNT"
echo "Destination Container: \$web"
echo "Source Folder: ./frontend/out"

# Ensure required env vars are set
if [[ -z "$AZURE_STORAGE_ACCOUNT" || -z "$AZURE_STORAGE_SAS_TOKEN" ]]; then
  echo "Error: AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_SAS_TOKEN must be set."
  exit 1
fi

# Upload static site to Azure Blob Storage ($web container)
az storage blob upload-batch \
  --account-name "$AZURE_STORAGE_ACCOUNT" \
  --destination '$web' \
  --source "./frontend/out" \
  --sas-token "$AZURE_STORAGE_SAS_TOKEN" \
  --overwrite

echo "✅ Static site successfully deployed to Azure Blob Storage."
