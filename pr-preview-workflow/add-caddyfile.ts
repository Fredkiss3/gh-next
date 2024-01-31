import { $, file, write } from "bun";

export async function addCaddyfile(
  PR_ID: number,
  PR_BRANCH: string,
  CADDY_CONFIG_FOLDER_PATH: string,
  shouldReloadCaddy: boolean
) {
  await $`echo '[🔄 Caddy] adding preview environment config...'`;
  const caddyfileToAdd = file(
    `${pathWithoutSlash(CADDY_CONFIG_FOLDER_PATH)}/pull-request-${PR_ID}.caddy`
  );

  if (await caddyfileToAdd.exists()) {
    await $`echo '[ℹ️ Caddy] Configuration for preview branch pull request #${PR_ID} already exists, skipping work.'`;
    return;
  }

  const CADDY_TEMPLATE_CONTENT = `gh-${PR_ID}.gh.fredkiss.dev, gh-${PR_BRANCH}.gh.fredkiss.dev {
    route {
       sablier {
         group gh-next-${PR_ID}
         session_duration 30m
         dynamic {
            theme ghost
            display_name preview environment ${PR_BRANCH} (pull request ID: ${PR_ID})
            refresh_frequency 5s
         }
       }
      reverse_proxy http://gh-next-${PR_ID}:3000 {
        header_up Host {http.request.host}
        # disables buffering
        flush_interval -1
      }
    }
    log
}`;

  await write(caddyfileToAdd, CADDY_TEMPLATE_CONTENT);
  await $`echo '[✅ caddy] config for pull request #${PR_ID} added successfully'`;
  if (shouldReloadCaddy) {
    // reload caddy service in docker
    await $`echo '[🔄 Caddy] reloading caddy server...'`;
    const { exitCode, stderr } =
      await $`docker exec $(docker ps -q -f name=caddy-stack_proxy) caddy reload -c /etc/caddy/Caddyfile`;
    if (exitCode !== 0) {
      await $`echo '[❌ Caddy] caddy service encountered an unexpected error : ${stderr.toString()}'`;
      process.exit(1);
    }
    await $`echo '[✅ Caddy] caddy server reloaded succesfully'`;
  }
}

function pathWithoutSlash(path: string) {
  if (path.endsWith("/")) {
    return path.substring(0, path.length - 1);
  }
  return path;
}
