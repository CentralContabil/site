module.exports = {
  apps: [{
    name: 'site-contabil-api',
    script: './api/server.ts',
    interpreter: 'tsx',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3006
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // Opções adicionais
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};



