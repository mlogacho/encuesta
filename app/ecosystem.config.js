module.exports = {
  apps: [
    {
      name: 'encuesta',
      script: 'server.js',
      cwd: '/home/mlogacho/encuesta',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
        ADMIN_PASSWORD: 'NexaCareer2026!'
      }
    }
  ]
};
