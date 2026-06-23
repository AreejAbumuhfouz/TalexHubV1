module.exports = {
  apps: [
    {
      name: 'TalexHub-backend',
      script: './server.js',
      cwd: '/home/u123456789/domains/TalexHub.com/backend', // ✅ غيّر إلى مسار مشروعك على Hostinger
      
      // ✅ Cluster mode على Hostinger VPS (4 CPUs)
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      
      watch: false,
      max_memory_restart: '1G',
      
      // ✅ Node.js arguments
      node_args: [
        '--max-old-space-size=2048',     // زيادة الذاكرة
        '--expose-gc',                   // تحسين garbage collection
        '--optimize-for-size',           // تحسين الأداء
      ].join(' '),
      
      // ✅ Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        instances: 1,
        exec_mode: 'fork',
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // ✅ Cloudflare specific
        TRUST_PROXY: true,
        BEHIND_PROXY: true,
      },
      
      // ✅ Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,
      log_file: './logs/combined.log',
      
      // ✅ Graceful shutdown
      kill_timeout: 15000,               // 15 seconds for graceful shutdown
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,
      
      // ✅ Restart policies
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // ✅ Auto restart on crash
      autorestart: true,
      
      // ✅ Cron restart (optional - restart at 4 AM daily)
      cron_restart: '0 4 * * *',
      
      // ✅ Instance management
      instance_var: 'INSTANCE_ID',
      combine_logs: true,
      
      // ✅ Error handling
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'temp'],
      
      // ✅ Source map support
      source_map_support: true,
      
      // ✅ Timezone
      time: true,
    },
  ],
  
  // ✅ Deployment configuration (optional)
  deploy: {
    production: {
      user: 'u123456789',                          // Hostinger username
      host: 'your-domain.com',                     // أو IP address
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/TalexHub-backend.git',
      path: '/home/u123456789/domains/TalexHub.com',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};