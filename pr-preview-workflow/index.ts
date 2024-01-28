import { parseArgs } from "node:util";
import { z } from "zod";
import { addDockerApp } from "./add-docker-app";
import { addCaddyfile } from "./add-caddyfile";

const argSchema = z.object({
  "pr-id": z.coerce.number(),
  "pr-branch": z.string(),
  "caddy-config-path": z.string(),
  "reload-caddy": z.boolean(),
  "reload-docker": z.boolean()
});

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    "pr-id": {
      type: "string"
    },
    "pr-branch": {
      type: "string"
    },
    "caddy-config-path": {
      type: "string",
      default: "./caddy-test" // for testing locally
    },
    "reload-caddy": {
      type: "boolean",
      default: false
    },
    "reload-docker": {
      type: "boolean",
      default: false
    }
  },
  strict: true,
  allowPositionals: true
});

const {
  "pr-id": PR_ID,
  "pr-branch": PR_BRANCH,
  "caddy-config-path": CADDY_CONFIG_FOLDER_PATH,
  "reload-caddy": shouldReloadCaddy,
  "reload-docker": shouldReloadDockerStack
} = argSchema.parse(values);

const MAX_OPEN_PORTS = 100,
  STARTING_PORT_RANGE = 9100;

await addDockerApp(
  PR_ID,
  shouldReloadDockerStack,
  MAX_OPEN_PORTS,
  STARTING_PORT_RANGE
);
await addCaddyfile(
  PR_ID,
  PR_BRANCH,
  CADDY_CONFIG_FOLDER_PATH,
  shouldReloadCaddy,
  MAX_OPEN_PORTS,
  STARTING_PORT_RANGE
);
