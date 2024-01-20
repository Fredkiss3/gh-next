#!/bin/bash

# Check if PR ID is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 PR_ID"
    exit 1
fi

# Read PR ID from command line argument
PR_ID="$1"

# Path to the global Caddyfile
CADDYFILE_PATH="docker/caddyfile.pr"
touch $CADDYFILE_PATH

# Template content with placeholders replaced
TEMPLATE_CONTENT="${PR_ID}.gh.fredkiss.dev {
    route {
       sablier  {
         group codex-pr-${PR_ID}
         session_duration 5m 
         blocking
       }

      reverse_proxy app-pr-${PR_ID}:3000
    }
}"

# Check if the Caddyfile already contains this PR's configuration
if grep -q "${PR_ID}.gh.fredkiss.dev" "$CADDYFILE_PATH"; then
    echo "Configuration for PR_ID ${PR_ID} already exists in Caddyfile."
else
    echo "Appending new configuration for PR_ID ${PR_ID} to Caddyfile."
    echo "$TEMPLATE_CONTENT" >> "$CADDYFILE_PATH"
fi
