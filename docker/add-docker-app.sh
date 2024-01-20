#!/bin/bash

# Check if PR ID is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 PR_ID"
    exit 1
fi

# Read PR ID from command line argument
PR_ID="$1"

COMPOSE_FILE_PATH="docker/docker-stack.pr.yaml"


# Placeholder text in the Docker Compose file
PLACEHOLDER="# -- NEW SERVICES GO HERE --"

# Check if the service already exists
if grep -q "app-pr-${PR_ID}" "$COMPOSE_FILE_PATH"; then
    echo "Service for PR_ID ${PR_ID} already exists in the Docker Compose file."
    exit 0
fi

# Service configuration lines
read -r -d '' NEW_SERVICE << EOM
# app service configuration for ${PR_ID}
app-pr-${PR_ID}:
  image: dcr.fredkiss.dev/gh-next:pr-${PR_ID}
  deploy:
    replicas: 0
    update_config:
      parallelism: 1
      delay: 5s
      order: start-first
      failure_action: rollback
    restart_policy:
      condition: on-failure
      delay: 5s
      max_attempts: 3
      window: 120s
    labels:
      - sablier.enable=true
      - sablier.group=codex_pr_${PR_ID}
  networks:
    - gh-next
EOM

# Add each line of the new service configuration above the placeholder
while IFS= read -r line; do
    sed -i '.bak' "s|${PLACEHOLDER}|${line}\\n\ \ ${PLACEHOLDER}|" "${COMPOSE_FILE_PATH}"
done <<< "${NEW_SERVICE}"

if grep -q "app-pr-${PR_ID}" "$COMPOSE_FILE_PATH"; then
  echo "Service for PR_ID ${PR_ID} has been added."
else
  echo "An Error occured when appending new configuration for PR_ID ${PR_ID} to docker-compose file."
  exit 1
fi
