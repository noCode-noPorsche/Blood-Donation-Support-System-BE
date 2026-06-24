module.exports = {
  apps: [
    {
      name: 'blood_donation_support_be',
      script: 'dist/index.js', // Trỏ thẳng vào file chạy của Next.js
      watch: false,
      env: {
        PORT: 8080 // Cấu hình cổng chạy ứng dụng tại đây
      }
    }
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}
