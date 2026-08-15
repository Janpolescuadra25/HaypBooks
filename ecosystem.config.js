module.exports = {
  apps: [
    {
      name: 'haypbooks-backend',
      script: 'dist/main.js',
      cwd: './Backend',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    },
    {
      name: 'haypbooks-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './Frontend',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
