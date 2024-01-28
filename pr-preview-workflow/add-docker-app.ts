import { $, file, write } from "bun";

export async function addDockerApp(
  PR_ID: number,
  shouldReloadDockerStack: boolean,
  MAX_OPEN_PORTS: number,
  STARTING_PORT_RANGE: number
) {
  await $`echo '[🔄 Docker] adding docker stack config...'`;
  const COMPOSE_FILE_PATH = `./docker/docker-stack.pr-${PR_ID}.yaml`;

  const composeFile = file(COMPOSE_FILE_PATH);

  if (await composeFile.exists()) {
    await $`echo '[ℹ️ Docker] docker stack config for pull request #${PR_ID} already exists, skipping work.'`;
    if (shouldReloadDockerStack) {
      await $`echo '[🔄 Docker] updating docker services...'`;
      const { exitCode, stderr } =
        await $`docker stack deploy --with-registry-auth --compose-file ${COMPOSE_FILE_PATH} gh-stack-pr-${PR_ID}`;

      if (exitCode !== 0) {
        await $`echo '[❌ Docker] docker services encountered an unexpected error : ${stderr.toString()}'`;
        process.exit(1);
      }
      await $`echo '[✅ Docker] docker services updated succesfully'`;
    }
    return;
  }

  const files =
    $`ls ./docker | grep -E '^docker-stack\.pr\-[0-9]+\.yaml$'`.lines();

  let stackPRFiles = await Array.fromAsync(files).then((arr) =>
    arr
      .filter(Boolean)
      // sort from the lowest pr number to the highest
      .sort((a, b) => {
        const numberA = parseInt(
          // @ts-expect-error
          a.match(/^docker-stack\.pr\-(\d+)\.yaml$/)[1],
          10
        );
        const numberB = parseInt(
          // @ts-expect-error
          b.match(/^docker-stack\.pr\-(\d+)\.yaml$/)[1],
          10
        );
        return numberA - numberB;
      })
  );

  // don't go over 100 config max
  if (stackPRFiles.length === MAX_OPEN_PORTS) {
    const [leastRecentPullRequestFile, ...rest] = stackPRFiles;

    const leastRecentPullRequestID = parseInt(
      // @ts-expect-error
      leastRecentPullRequestFile.match(/^docker-stack\.pr\-(\d+)\.yaml$/)[1],
      10
    );

    await $`echo '[🔄 Docker] docker stack config for pull request #${leastRecentPullRequestID} is too old, deleting it...'`;
    await $`echo '[ℹ️ Docker] you can still recreate it by deploying the associated pull request'`;

    await $`echo '[🔄 Docker] Removing associated docker stack services...'`;
    await $`docker stack rm gh-stack-pr-${PR_ID}`;
    await $`echo '[✅ Docker] associated docker stack services removed succesfully'`;

    // delete the least recent Pull Request
    await $`rm './docker/${leastRecentPullRequestFile}'`;

    // delete the least recent Pull Request
    await $`echo '[✅ Docker] docker stack config for pull request #${leastRecentPullRequestID} deleted'`;

    stackPRFiles = rest;
  }

  const portNumber = STARTING_PORT_RANGE + stackPRFiles.length;

  // Placeholder text in the Docker Compose file
  const DOCKER_STACK_TEMPLATE = `# service configuration for pull request #132
version: "3.4"

services:
  gh-next-${PR_ID}:
    image: dcr.fredkiss.dev/gh-next:pr-${PR_ID}
    ports:
      - "${portNumber}:3000"
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
        - sablier.group=gh-next-${PR_ID}
    networks:
      - gh-next
networks:
  gh-next:
    external: true
`;
  await write(composeFile, DOCKER_STACK_TEMPLATE);
  await $`echo '[✅ Docker] Added docker stack config file for pull request #${PR_ID}.'`;
  if (shouldReloadDockerStack) {
    await $`echo '[🔄 Docker] updating docker services...'`;
    const { exitCode, stderr } =
      await $`docker stack deploy --with-registry-auth --compose-file ${COMPOSE_FILE_PATH} gh-stack-pr-${PR_ID}`;

    if (exitCode !== 0) {
      await $`echo '[❌ Docker] docker services encountered an unexpected error : ${stderr.toString()}'`;
      process.exit(1);
    }
    await $`echo '[✅ Docker] docker services updated succesfully'`;
  }
}
