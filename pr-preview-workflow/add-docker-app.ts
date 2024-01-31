import { $, file, write } from "bun";

export async function addDockerApp(
  PR_ID: number,
  shouldReloadDockerStack: boolean
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

  // Placeholder text in the Docker Compose file
  const DOCKER_STACK_TEMPLATE = `# service configuration for pull request #132
version: "3.4"

services:
  gh-next-${PR_ID}:
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
