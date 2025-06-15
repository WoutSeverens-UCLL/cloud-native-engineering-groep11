#!/bin/bash

# Set your Azure Storage account name, container name, and SAS token
storage_account="$AZURE_STORAGE_ACCOUNT"
container_name="$AZURE_STORAGE_CONTAINER"
sas_token="$AZURE_STORAGE_SAS_TOKEN"

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Set the local folder path using absolute path
local_folder="${SCRIPT_DIR}/frontend/out"

echo "Looking for files in: ${local_folder}"

# Check if directory exists
if [ ! -d "$local_folder" ]; then
    echo "Error: Directory ${local_folder} does not exist"
    ls -la "${SCRIPT_DIR}/frontend"
    exit 1
fi

# Iterate over each file in the local folder and its subfolders
find "$local_folder" -type f | while read -r file_path; do
    if [ -f "$file_path" ]; then
        # Extract the relative path from the local folder
        relative_path=${file_path#$local_folder/}

        # Construct the Blob Storage URL for the file
        blob_url="https://$storage_account.blob.core.windows.net/$container_name/$relative_path?$sas_token"

        # Set Content-Type based on file extension
        extension="${file_path##*.}"
        content_type=""
        if [ "$extension" == "css" ]; then
            content_type="text/css"
        else
            content_type=$(file --mime-type -b "$file_path")
        fi

        echo "Uploading: $relative_path"
        # Upload the file to Blob Storage using curl
        curl -X PUT -T "$file_path" -H "x-ms-blob-type: BlockBlob" -H "Content-Type: $content_type" "$blob_url"
    fi
done
