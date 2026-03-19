/**
 * PM2 ecosystem configuration for production.
 *
 * This is intended to run the compiled dist output, not the TS source.
 * It also sets a sensible heap limit and restarts on crashes.
 */
module.exports = {
  apps: [
    {
      name: 'haypbooks-backend',
      script: 'dist/main.js',
      // Ensure the backend is built before running this in CI/CD.
      // If you have a build step, run it first: npm run build
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    },
  ],
};
