module.exports = {
  apps: [
    {
      name: "gh-clone",
      script: ".next/standalone/server.js",
      time: true,
      instances: 2,
      autorestart: true,
      max_restarts: 5,
      exec_mode: "cluster_mode",
      watch: false,
      max_memory_restart: "1G",
      wait_ready: true,
      listen_timeout: 10_000,
      increment_var: "PORT",
      env: {
        PORT: 8892,
        HOSTNAME: "0.0.0.0"
      }
    }
  ]
};
