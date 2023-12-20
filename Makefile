domain := $(DEPLOY_DOMAIN)
server := "$(DEPLOY_USER)@$(domain)"
dir := "$(DEPLOY_DIR)"

.DEFAULT_GOAL := help
help: ### Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: build-local
build-local: ### Build docker image locally
	while read -r line; do
		build_args="$build_args --build-arg $line"
	done < .env.docker.local
	docker build $build_args -t gh-next:latest .