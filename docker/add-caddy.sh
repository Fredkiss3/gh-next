#!/bin/bash
set -e -o errexit

# Check if PR ID is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 PR_ID PR_BRANCH"
    exit 1
fi

# Read PR ID from command line argument
PR_ID="$1"
PR_BRANCH="$2"

# Path to the global Caddyfile
CADDYFILE_PATH="docker/pr.caddyfile"
touch $CADDYFILE_PATH

# Template content with placeholders replaced
TEMPLATE_CONTENT="http://pr-${PR_ID}.gh.fredkiss.dev, http://pr-${PR_BRANCH}.gh.fredkiss.dev {
    route {
       sablier  {
         group gh-next-${PR_ID}
         session_duration 30m 
         dynamic {
            theme ghost
            display_name gh-next-${PR_ID}
            refresh_frequency 5s
         }
       }

      reverse_proxy gh-next-${PR_ID}:3000
    }
}"

# Check if the Caddyfile already contains this PR's configuration
if grep -q "http://pr-${PR_ID}.gh.fredkiss.dev" "$CADDYFILE_PATH"; then
    echo "Configuration for PR_ID ${PR_ID} already exists in Caddyfile."
else
    echo "Appending new configuration for PR_ID ${PR_ID} to Caddyfile."
    echo "$TEMPLATE_CONTENT" >> "$CADDYFILE_PATH"
fi
