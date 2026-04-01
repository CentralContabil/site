// Configuração PM2 para VPS Hostinger
// Domínio: central-rnc.com.br
// Usuário: root
// Use: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [{
    name: 'central-rnc',
    script: 'npx',
    args: 'tsx api/server.ts',
    cwd: '/root/app',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3006
    },
    error_file: '/root/logs/pm2-error.log',
    out_file: '/root/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};


