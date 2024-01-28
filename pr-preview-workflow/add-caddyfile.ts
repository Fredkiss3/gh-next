import { $, file, write } from "bun";

export async function addCaddyfile(
  PR_ID: number,
  PR_BRANCH: string,
  CADDY_CONFIG_FOLDER_PATH: string,
  shouldReloadCaddy: boolean,
  MAX_CONFIG_NUMBER: number,
  STARTING_PORT_RANGE: number
) {
  await $`echo '[🔄 Caddy] adding preview environment config...'`;
  const caddyfileToAdd = file(
    `${pathWithoutSlash(CADDY_CONFIG_FOLDER_PATH)}/pull-request-${PR_ID}.caddy`
  );

  if (await caddyfileToAdd.exists()) {
    await $`echo '[ℹ️  Caddy] Configuration for preview branch pull request #${PR_ID} already exists, skipping work.'`;
    return;
  }

  const files =
    $`ls ${CADDY_CONFIG_FOLDER_PATH} | grep -E '^pull-request\-[0-9]+\.caddy$'`.lines();

  let caddyPRFiles = await Array.fromAsync(files).then((arr) =>
    arr
      .filter(Boolean)
      // sort from the lowest pr number to the highest
      .sort((a, b) => {
        // @ts-expect-error
        const numberA = parseInt(a.match(/pull-request-(\d+)\.caddy/)[1], 10);
        // @ts-expect-error
        const numberB = parseInt(b.match(/pull-request-(\d+)\.caddy/)[1], 10);
        return numberA - numberB;
      })
  );

  // don't go over 100 config max
  if (caddyPRFiles.length === MAX_CONFIG_NUMBER) {
    const [leastRecentPullRequestFile, ...rest] = caddyPRFiles;

    const leastRecentPullRequestID = parseInt(
      // @ts-expect-error
      leastRecentPullRequestFile.match(/pull-request-(\d+)\.caddy/)[1],
      10
    );

    await $`echo '[🔄 Caddy] preview environment config for pull request #${leastRecentPullRequestID} is too old, deleting it...'`;
    await $`echo '[ℹ️  Caddy] you can still redeploy this env by deploying the associated pull request'`;

    // delete the least recent Pull Request
    await $`rm '${pathWithoutSlash(
      CADDY_CONFIG_FOLDER_PATH
    )}/${leastRecentPullRequestFile}'`;

    await $`echo '[✅ Caddy] preview environment config for pull request #${leastRecentPullRequestID} deleted'`;

    caddyPRFiles = rest;
  }

  const portNumber = STARTING_PORT_RANGE + caddyPRFiles.length;
  const CADDY_TEMPLATE_CONTENT = `gh-${PR_ID}.gh.fredkiss.dev, gh-${PR_BRANCH}.gh.fredkiss.dev {
    route {
       sablier http://localhost:10000 {
         group gh-next-${PR_ID}
         session_duration 30m
         dynamic {
            theme ghost
            display_name preview environment ${PR_BRANCH} (pull request: ${PR_ID})
            refresh_frequency 5s
         }
       }
      reverse_proxy 127.0.0.1:${portNumber} {
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
    await $`docker exec $(docker ps -q -f name=caddy-stack_proxy) caddy reload -c /etc/caddy/Caddyfile`;
    await $`echo '[✅ Caddy] caddy server reloaded succesfully'`;
  }
}

function pathWithoutSlash(path: string) {
  if (path.endsWith("/")) {
    return path.substring(0, path.length - 1);
  }
  return path;
}
