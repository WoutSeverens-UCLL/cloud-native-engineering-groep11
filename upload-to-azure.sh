#!/bin/bash

storage_account="$AZURE_STORAGE_ACCOUNT"
container_name="$AZURE_STORAGE_CONTAINER"
sas_token="$AZURE_STORAGE_SAS_TOKEN"

# Set the local folder path
local_folder="./frontend/out"

find "$local_folder" -type f | while read -r file_path; do
    if [ -f "$file_path" ]; then
        relative_path=${file_path#$local_folder/}
        blob_url="https://$storage_account.blob.core.windows.net/$container_name/$relative_path?$sas_token"

        extension="${file_path##*.}"
        content_type=$(file --mime-type -b "$file_path")

        echo "Uploading $relative_path..."

        curl -X PUT -T "$file_path" \
            -H "x-ms-blob-type: BlockBlob" \
            -H "Content-Type: $content_type" \
            -H "Cache-Control: no-cache" \
            "$blob_url"
    fi
done
