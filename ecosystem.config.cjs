module.exports = {
  apps: [
    {
      name: 'lth-bot',
      script: 'index.js',
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      restart_delay: 3000,
      max_restarts: 10,
    }
  ]
};
