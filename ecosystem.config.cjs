module.exports = {
  apps: [
    {
      name: "gh-clone",
      script: ".next/standalone/server.js",
      time: true,
      instances: 3,
      autorestart: true,
      max_restarts: 10,
      exec_mode: "cluster_mode",
      watch: false,
      instance_var: "INSTANCE_ID",
      max_memory_restart: "1G",
      env: {
        PORT: 8889,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
